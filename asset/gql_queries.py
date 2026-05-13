"""GraphQL object types & filterable connection field declarations."""
import graphene
from graphene_django import DjangoObjectType

from core import ExtendedConnection
from core.schema import OrderedDjangoFilterConnectionField

from .models import Asset, AssetAssignment, AssetStatus, DeviceType


class DeviceTypeGQLType(DjangoObjectType):
    class Meta:
        model = DeviceType
        interfaces = (graphene.relay.Node,)
        filter_fields = {
            "code": ["exact", "icontains"],
            "name": ["exact", "icontains"],
        }
        connection_class = ExtendedConnection


class AssetStatusGQLType(DjangoObjectType):
    class Meta:
        model = AssetStatus
        interfaces = (graphene.relay.Node,)
        filter_fields = {
            "code": ["exact"],
            "can_assign": ["exact"],
            "is_default": ["exact"],
        }
        connection_class = ExtendedConnection


class AssetGQLType(DjangoObjectType):
    class Meta:
        model = Asset
        interfaces = (graphene.relay.Node,)
        filter_fields = {
            "id": ["exact"],
            "name": ["exact", "icontains"],
            "serial_number": ["exact", "icontains"],
            "imei": ["exact", "icontains"],
            "manufacturer": ["exact", "icontains"],
            "model": ["exact", "icontains"],
            "os_version": ["exact", "icontains"],
            "status__code": ["exact"],
            "device_type__code": ["exact"],
            "location__id": ["exact"],
            "assigned_to__id": ["exact"],
            "is_deleted": ["exact"],
        }
        connection_class = ExtendedConnection


class AssetAssignmentGQLType(DjangoObjectType):
    is_active = graphene.Boolean()

    class Meta:
        model = AssetAssignment
        interfaces = (graphene.relay.Node,)
        filter_fields = {
            "asset__id": ["exact"],
            "assigned_to__id": ["exact"],
            "returned_date": ["isnull"],
        }
        connection_class = ExtendedConnection

    def resolve_is_active(self, info):
        return self.returned_date is None
