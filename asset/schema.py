"""Aggregator schema — exposed in the openIMIS assembly's central schema."""
import graphene
from django.core.exceptions import PermissionDenied
from django.utils.translation import gettext as _

from core.schema import OrderedDjangoFilterConnectionField
from graphene_django.filter import DjangoFilterConnectionField

from .apps import AssetConfig
from .gql_queries import (
    AssetGQLType,
    AssetAssignmentGQLType,
    AssetStatusGQLType,
    DeviceTypeGQLType,
)
from .gql_mutations import (
    AssignAssetMutation,
    CreateAssetMutation,
    DeleteAssetMutation,
    MarkAssetForRepairMutation,
    RetireAssetMutation,
    UnassignAssetMutation,
    UpdateAssetMutation,
)


def _require(user, perms):
    if not user.has_perms(perms):
        raise PermissionDenied(_("unauthorized"))


class Query(graphene.ObjectType):
    assets = OrderedDjangoFilterConnectionField(
        AssetGQLType,
        orderBy=graphene.List(of_type=graphene.String),
        show_history=graphene.Boolean(),
    )
    asset_assignments = OrderedDjangoFilterConnectionField(
        AssetAssignmentGQLType,
        orderBy=graphene.List(of_type=graphene.String),
        active_only=graphene.Boolean(),
    )
    device_types = DjangoFilterConnectionField(DeviceTypeGQLType)
    asset_statuses = DjangoFilterConnectionField(AssetStatusGQLType)

    def resolve_assets(self, info, **kwargs):
        _require(info.context.user, AssetConfig.gql_query_assets_perms)
        from .models import Asset
        qs = Asset.objects.all()
        if not kwargs.get("show_history"):
            qs = qs.filter(is_deleted=False)

        return qs

    def resolve_asset_assignments(self, info, **kwargs):
        _require(info.context.user,
                 AssetConfig.gql_query_asset_assignments_perms)
        from .models import AssetAssignment
        qs = AssetAssignment.objects.filter(is_deleted=False)
        if kwargs.get("active_only"):
            qs = qs.filter(returned_date__isnull=True)
        return qs

    def resolve_device_types(self, info, **kwargs):
        _require(info.context.user, AssetConfig.gql_query_device_types_perms)
        from .models import DeviceType
        return DeviceType.objects.filter(is_deleted=False)

    def resolve_asset_statuses(self, info, **kwargs):
        _require(info.context.user, AssetConfig.gql_query_asset_statuses_perms)
        from .models import AssetStatus
        return AssetStatus.objects.filter(is_deleted=False)


class Mutation(graphene.ObjectType):
    create_asset = CreateAssetMutation.Field()
    update_asset = UpdateAssetMutation.Field()
    delete_asset = DeleteAssetMutation.Field()
    assign_asset = AssignAssetMutation.Field()
    unassign_asset = UnassignAssetMutation.Field()
    mark_asset_for_repair = MarkAssetForRepairMutation.Field()
    retire_asset = RetireAssetMutation.Field()
