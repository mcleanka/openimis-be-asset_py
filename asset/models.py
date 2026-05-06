"""
openIMIS Asset module models.

Conventions:
* Inherit ``core.HistoryModel`` so every entity gets:
    - ``id`` (UUID PK), ``uuid`` (legacy compatibility), ``legacy_id``,
      ``validity_from``, ``validity_to``, ``version``, ``json_ext``.
* Soft-delete by setting ``validity_to``; never hard-delete from code paths.
* No custom ``User``/``Region`` — reuse ``core.User`` and
  ``location.Location``.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import HistoryModel, User
from location.models import Location


class DeviceType(HistoryModel):
    """Reference table — phone, tablet, ..."""
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, default="")

    class Meta:
        db_table = "asset_DeviceType"
        verbose_name = _("Device type")
        verbose_name_plural = _("Device types")
        ordering = ["name"]

    def __str__(self):
        return self.name


class AssetStatus(HistoryModel):
    """Reference table — available, assigned, repair, retired, ..."""
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, default="")

    can_assign = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = "asset_AssetStatus"
        verbose_name = _("Asset status")
        verbose_name_plural = _("Asset statuses")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Asset(HistoryModel):
    """A trackable mobile device assigned to a region (Location) and
    optionally to a holder (core.User)."""
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)

    device_type = models.ForeignKey(
        DeviceType,
        on_delete=models.PROTECT,
        related_name="assets",
    )
    status = models.ForeignKey(
        AssetStatus,
        on_delete=models.PROTECT,
        related_name="assets",
    )
    # openIMIS hierarchical location; we expect ``type='R'`` (region) here.
    location = models.ForeignKey(
        Location,
        on_delete=models.PROTECT,
        related_name="assets",
    )
    assigned_to = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_assets",
    )

    class Meta:
        db_table = "asset_Asset"
        verbose_name = _("Asset")
        verbose_name_plural = _("Assets")

    def __str__(self):
        return f"{self.name} ({self.serial_number})"


class AssetAssignment(HistoryModel):
    """Audit-trail row — one per (re)assignment of an Asset to a User."""
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name="assignment_history",
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="asset_assignments_received",
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="asset_assignments_made",
    )
    assigned_date = models.DateTimeField(auto_now_add=True)
    returned_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")

    snapshot_status = models.ForeignKey(
        AssetStatus,
        on_delete=models.PROTECT,
        related_name="assignment_snapshots",
        null=True, blank=True,
    )
    snapshot_location = models.ForeignKey(
        Location,
        on_delete=models.PROTECT,
        related_name="assignment_snapshots",
        null=True, blank=True,
    )

    class Meta:
        db_table = "asset_AssetAssignment"
        verbose_name = _("Asset assignment")
        verbose_name_plural = _("Asset assignments")
        ordering = ["-assigned_date"]


class AssetMutation(models.Model):
    """Join table linking openIMIS ``MutationLog`` rows to assets, mirroring
    the pattern used by ``claim.ClaimMutation`` / ``insuree.InsureeMutation``.
    """
    asset = models.ForeignKey(
        Asset, on_delete=models.CASCADE, related_name="mutations")
    mutation = models.ForeignKey(
        "core.MutationLog",
        on_delete=models.CASCADE,
        related_name="assets",
    )

    class Meta:
        db_table = "asset_AssetMutation"
