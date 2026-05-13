"""OpenIMISMutation subclasses for the Asset module."""
import graphene
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.utils.translation import gettext as _

from core.gql.gql_mutations.base_mutation import BaseMutation
from core.schema import OpenIMISMutation

from .apps import AssetConfig
from .models import Asset
from . import services


# --------------------------------------------------------------------------- #
# Input types
# --------------------------------------------------------------------------- #
class AssetInputType(OpenIMISMutation.Input):
    uuid = graphene.String(required=False)
    name = graphene.String(required=True)
    serial_number = graphene.String(required=True)
    imei = graphene.String(required=False)
    manufacturer = graphene.String(required=False)
    model = graphene.String(required=False)
    os_version = graphene.String(required=False)
    device_type_id = graphene.String(required=False)
    status_id = graphene.String(required=False)
    location_id = graphene.Int(required=True)


class AssetActionInputType(OpenIMISMutation.Input):
    uuid = graphene.String(required=True)
    user_uuid = graphene.String(required=False)
    notes = graphene.String(required=False)


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _check(user, perms):
    if isinstance(user, AnonymousUser) or not user.is_authenticated:
        raise PermissionDenied(_("unauthorized"))
    if not user.has_perms(perms):
        raise PermissionDenied(_("unauthorized"))


def _get_asset(uuid):
    return Asset.objects.filter(id=uuid, is_deleted=False).first()


# --------------------------------------------------------------------------- #
# Mutations
# --------------------------------------------------------------------------- #
class CreateAssetMutation(OpenIMISMutation):
    _mutation_module = "asset"
    _mutation_class = "CreateAssetMutation"

    class Input(AssetInputType):
        pass

    @classmethod
    def async_mutate(cls, user, **data):
        _check(user, AssetConfig.gql_mutation_create_assets_perms)
        data.pop("client_mutation_id", None)
        data.pop("client_mutation_label", None)
        services.create_asset(user=user, data=data)
        return []


class UpdateAssetMutation(OpenIMISMutation):
    _mutation_module = "asset"
    _mutation_class = "UpdateAssetMutation"

    class Input(AssetInputType):
        pass

    @classmethod
    def async_mutate(cls, user, **data):
        _check(user, AssetConfig.gql_mutation_update_assets_perms)
        uuid = data.pop("uuid", None)
        data.pop("client_mutation_id", None)
        data.pop("client_mutation_label", None)
        asset = _get_asset(uuid)
        if not asset:
            return [{"message": _("asset.validation.not_found"),
                     "detail": uuid}]
        services.update_asset(user=user, asset=asset, data=data)
        return []


class DeleteAssetMutation(OpenIMISMutation):
    _mutation_module = "asset"
    _mutation_class = "DeleteAssetMutation"

    class Input(OpenIMISMutation.Input):
        uuid = graphene.String(required=True)

    @classmethod
    def async_mutate(cls, user, **data):
        _check(user, AssetConfig.gql_mutation_delete_assets_perms)
        asset = _get_asset(data.get("uuid"))
        if not asset:
            return [{"message": _("asset.validation.not_found")}]
        return services.delete_asset(user=user, asset=asset) or []


class AssignAssetMutation(OpenIMISMutation):
    _mutation_module = "asset"
    _mutation_class = "AssignAssetMutation"

    class Input(AssetActionInputType):
        user_uuid = graphene.String(required=True)

    @classmethod
    def async_mutate(cls, user, **data):
        from core.models import User as CoreUser
        _check(user, AssetConfig.gql_mutation_assign_assets_perms)
        asset = _get_asset(data["uuid"])
        if not asset:
            return [{"message": _("asset.validation.not_found")}]
        holder = CoreUser.objects.filter(id=data["user_uuid"]).first()
        if not holder:
            return [{"message": _("asset.validation.user_not_found")}]
        return services.assign_asset(
            user=user, asset=asset, holder=holder,
            notes=data.get("notes", "")) or []


class UnassignAssetMutation(OpenIMISMutation):
    _mutation_module = "asset"
    _mutation_class = "UnassignAssetMutation"

    class Input(AssetActionInputType):
        pass

    @classmethod
    def async_mutate(cls, user, **data):
        _check(user, AssetConfig.gql_mutation_unassign_assets_perms)
        asset = _get_asset(data["uuid"])
        if not asset:
            return [{"message": _("asset.validation.not_found")}]
        return services.unassign_asset(
            user=user, asset=asset, notes=data.get("notes", "")) or []


class MarkAssetForRepairMutation(OpenIMISMutation):
    _mutation_module = "asset"
    _mutation_class = "MarkAssetForRepairMutation"

    class Input(AssetActionInputType):
        pass

    @classmethod
    def async_mutate(cls, user, **data):
        _check(user, AssetConfig.gql_mutation_repair_assets_perms)
        asset = _get_asset(data["uuid"])
        if not asset:
            return [{"message": _("asset.validation.not_found")}]
        return services.mark_for_repair(
            user=user, asset=asset, notes=data.get("notes", "")) or []


class RetireAssetMutation(OpenIMISMutation):
    _mutation_module = "asset"
    _mutation_class = "RetireAssetMutation"

    class Input(AssetActionInputType):
        pass

    @classmethod
    def async_mutate(cls, user, **data):
        _check(user, AssetConfig.gql_mutation_retire_assets_perms)
        asset = _get_asset(data["uuid"])
        if not asset:
            return [{"message": _("asset.validation.not_found")}]
        return services.retire_asset(
            user=user, asset=asset, notes=data.get("notes", "")) or []
