"""
Service layer for the Asset module.
Both GraphQL mutations (preferred) and REST views (optional, for backwards
compatibility) call into this module — never duplicate rules in either layer.
"""
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext as _

from core.models import User
from location.models import Location

from .apps import AssetConfig
from .models import Asset, AssetAssignment, AssetStatus, DeviceType


# --------------------------------------------------------------------------- #
# Lookups / defaults
# --------------------------------------------------------------------------- #
def _status(code):
    return AssetStatus.objects.filter(
        code=code, is_deleted=False
    ).first()


def _default_status():
    return _status(AssetConfig.default_asset_status_code)


def _default_device_type():
    return DeviceType.objects.filter(
        code=AssetConfig.default_device_type_code,
        is_deleted=False,
    ).first()


# --------------------------------------------------------------------------- #
# Validation
# --------------------------------------------------------------------------- #
def validate_assignment(asset: Asset, user: User):
    """Return list of error dicts; empty list = OK."""
    errors = []

    if asset.status and not asset.status.can_assign:
        errors.append({
            "message": _("asset.validation.not_assignable"),
            "detail": _("Asset status %(s)s does not allow assignment.")
                      % {"s": asset.status.name},
        })

    if AssetConfig.enforce_same_region_assignment:
        # core.User → InteractiveUser → location is configured per deployment.
        # We assume an `i_user.location_id` or similar; adapt to your assembly.
        user_location = getattr(user, "location_id", None) or \
            getattr(getattr(user, "i_user", None), "location_id", None)
        if user_location and user_location != asset.location_id:
            errors.append({
                "message": _("asset.validation.region_mismatch"),
                "detail": _("Asset and user must belong to the same region."),
            })

    if asset.assigned_to_id:
        errors.append({
            "message": _("asset.validation.already_assigned"),
            "detail": _("Asset is already assigned. Unassign it first."),
        })

    return errors


# --------------------------------------------------------------------------- #
# CRUD-ish operations (called from gql_mutations)
# --------------------------------------------------------------------------- #
@transaction.atomic
def create_asset(*, user: User, data: dict) -> Asset:
    if "device_type_id" not in data and "device_type" not in data:
        data["device_type"] = _default_device_type()
    if "status_id" not in data and "status" not in data:
        data["status"] = _default_status()

    asset = Asset(**data)
    asset.save(username=user.username)
    return asset


@transaction.atomic
def update_asset(*, user: User, asset: Asset, data: dict) -> Asset:
    for field, value in data.items():
        setattr(asset, field, value)
    asset.save(username=user.username)
    return asset


@transaction.atomic
def delete_asset(*, user: User, asset: Asset) -> None:
    """Soft delete via HistoryModel."""
    if asset.assigned_to_id:
        return [{
            "message": _("asset.validation.delete_while_assigned"),
            "detail": _("Cannot delete an assigned asset; unassign first."),
        }]
    asset.delete(user=user)  # HistoryModel soft-delete (sets is_deleted)
    return []


@transaction.atomic
def assign_asset(*, user: User, asset: Asset, holder: User, notes: str = ""):
    errors = validate_assignment(asset, holder)
    if errors:
        return errors

    assigned_status = _status("assigned")
    if not assigned_status:
        return [{"message": _("asset.config.missing_status"),
                 "detail": "AssetStatus 'assigned' missing."}]

    aa = AssetAssignment(
        asset=asset,
        assigned_to=holder,
        assigned_by=user,
        snapshot_status=assigned_status,
        snapshot_location=asset.location,
        notes=notes,
    )
    aa.save(username=user.username)
    asset.assigned_to = holder
    asset.status = assigned_status
    asset.save(username=user.username)
    return []


@transaction.atomic
def unassign_asset(*, user: User, asset: Asset, notes: str = ""):
    if not asset.assigned_to_id:
        return [{"message": _("asset.validation.not_assigned"),
                 "detail": _("Asset is not assigned.")}]

    available = _status("available")
    if not available:
        return [{"message": _("asset.config.missing_status"),
                 "detail": "AssetStatus 'available' missing."}]

    active = asset.assignment_history.filter(returned_date__isnull=True).first()
    if active:
        active.returned_date = timezone.now()
        if notes:
            active.notes = notes
        active.save(username=user.username)

    asset.assigned_to = None
    asset.status = available
    asset.save(username=user.username)
    return []


@transaction.atomic
def mark_for_repair(*, user: User, asset: Asset, notes: str = ""):
    repair = _status("repair")
    if not repair:
        return [{"message": _("asset.config.missing_status"),
                 "detail": "AssetStatus 'repair' missing."}]

    active = asset.assignment_history.filter(returned_date__isnull=True).first()
    if active:
        active.returned_date = timezone.now()
        active.notes = f"Repair: {notes}".strip()
        active.save(username=user.username)

    asset.assigned_to = None
    asset.status = repair
    asset.save(username=user.username)
    return []


@transaction.atomic
def retire_asset(*, user: User, asset: Asset, notes: str = ""):
    retired = _status("retired")
    if not retired:
        return [{"message": _("asset.config.missing_status"),
                 "detail": "AssetStatus 'retired' missing."}]

    active = asset.assignment_history.filter(returned_date__isnull=True).first()
    if active:
        active.returned_date = timezone.now()
        active.notes = f"Retired: {notes}".strip()
        active.save(username=user.username)

    asset.assigned_to = None
    asset.status = retired
    asset.save(username=user.username)
    return []
