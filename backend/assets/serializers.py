from rest_framework import serializers
from .models import Region, User, Asset, DeviceType, AssetStatus, UserRole, AssetAssignment
from django.utils import timezone


class ChoiceField(serializers.SlugRelatedField):
    """Custom choice field that displays both code and name"""

    def to_representation(self, obj):
        return {
            'code': obj.code,
            'name': obj.name,
            'id': obj.id
        }


class DeviceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceType
        fields = ['id', 'name', 'code', 'description', 'is_active']


class AssetStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetStatus
        fields = ['id', 'name', 'code', 'description',
                  'can_assign', 'is_active_state']


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'name', 'code', 'description', 'permissions']


class RegionSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'stats', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_stats(self, obj):
        """Enhanced region statistics"""
        return {
            'total_users': obj.users.count(),
            'total_assets': obj.assets.count(),
            'available_assets': obj.assets.filter(status__code='available').count(),
            'assigned_assets': obj.assets.filter(status__code='assigned').count(),
        }


class UserSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    role_details = UserRoleSerializer(source='role', read_only=True)
    assigned_assets_count = serializers.SerializerMethodField()
    can_assign_more = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'role', 'role_name', 'role_details',
            'region', 'region_name', 'assigned_assets_count',
            'can_assign_more', 'created_at'
        ]
        read_only_fields = ['id', 'created_at',
                            'assigned_assets_count', 'can_assign_more']

    def get_assigned_assets_count(self, obj):
        """Get count of assets assigned to this user"""
        return obj.assigned_assets.count()

    def get_can_assign_more(self, obj):
        """Check if user can be assigned more assets"""
        return True

    def validate(self, data):
        """Validation for user operations"""
        instance = self.instance
        request = self.context.get('request')

        if instance and 'region' in data and instance.region != data['region']:
            if instance.assigned_assets.exists():
                raise serializers.ValidationError({
                    'region': 'Cannot change region while user has assigned assets. Unassign assets first.'
                })

        if instance and 'is_active' in data and data['is_active'] is False:
            if instance.assigned_assets.exists():
                raise serializers.ValidationError({
                    'is_active': 'Cannot deactivate user with assigned assets. Unassign assets first.'
                })

        return data

    def create(self, validated_data):
        """Set default role if not provided"""
        if 'role' not in validated_data:
            default_role = UserRole.objects.filter(is_default=True).first()
            if default_role:
                validated_data['role'] = default_role
        return super().create(validated_data)


class AssetListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    region_name = serializers.CharField(source='region.name', read_only=True)
    assigned_to_name = serializers.CharField(
        source='assigned_to.name', read_only=True)
    device_type_name = serializers.CharField(
        source='device_type.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'serial_number', 'device_type', 'device_type_name',
            'status', 'status_name', 'region_name', 'assigned_to_name'
        ]


class AssetDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all fields and relationships"""
    region_name = serializers.CharField(source='region.name', read_only=True)
    assigned_to_name = serializers.CharField(
        source='assigned_to.name', read_only=True)
    assigned_to_email = serializers.CharField(
        source='assigned_to.email', read_only=True)
    device_type_details = DeviceTypeSerializer(
        source='device_type', read_only=True)
    status_details = AssetStatusSerializer(source='status', read_only=True)
    assignment_history = serializers.SerializerMethodField()
    can_be_assigned = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'serial_number', 'device_type', 'device_type_details',
            'status', 'status_details', 'region', 'region_name', 'assigned_to', 'assigned_to_name', 'assigned_to_email',
            'assignment_history', 'can_be_assigned', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at',
                            'assignment_history', 'can_be_assigned']

    def get_assignment_history(self, obj):
        """Get recent assignment history if available"""
        if hasattr(obj, 'assignment_history'):
            from .models import AssetAssignment
            history = obj.assignment_history.all()[:5]
            return AssetAssignmentSerializer(history, many=True).data
        return []

    def get_can_be_assigned(self, obj):
        """Check if asset can be assigned"""
        return obj.status.can_assign if obj.status else False

    def validate(self, data):
        """Comprehensive business rule validation"""
        instance = self.instance
        assigned_to = data.get('assigned_to', getattr(
            instance, 'assigned_to', None))
        status = data.get('status', getattr(instance, 'status', None))
        region = data.get('region', getattr(instance, 'region', None))

        if 'status' in data and isinstance(data['status'], str):
            try:
                status = AssetStatus.objects.get(code=data['status'])
            except AssetStatus.DoesNotExist:
                raise serializers.ValidationError({'status': 'Invalid status'})

        if assigned_to and region and assigned_to.region != region:
            raise serializers.ValidationError({
                'assigned_to': 'Asset can only be assigned to a user in the same region.'
            })

        if assigned_to and status and not status.can_assign:
            raise serializers.ValidationError({
                'status': f'Cannot assign user when status is "{status.name}".'
            })

        if not assigned_to and status and status.code == 'assigned':
            raise serializers.ValidationError({
                'assigned_to': 'Assigned status requires a user to be assigned.'
            })

        if assigned_to and not assigned_to.is_active:
            raise serializers.ValidationError({
                'assigned_to': 'Cannot assign asset to inactive user.'
            })

        if status and status.code == 'retired' and assigned_to:
            raise serializers.ValidationError({
                'status': 'Cannot retire asset that is assigned to a user.'
            })

        return data

    def update(self, instance, validated_data):
        """Handle asset assignment with business logic"""
        assigned_to = validated_data.get('assigned_to')

        # Handle assignment/unassignment logic
        if assigned_to and not instance.assigned_to:
            instance.assign_to_user(assigned_to)
            return instance
        elif not assigned_to and instance.assigned_to:
            instance.unassign()
            return instance
        elif assigned_to and instance.assigned_to and assigned_to != instance.assigned_to:
            instance.unassign()
            instance.assign_to_user(assigned_to)
            return instance

        return super().update(instance, validated_data)


class AssetSerializer(AssetDetailSerializer):
    """Default asset serializer - alias for detailed view"""
    pass


class AssetAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for assignment history"""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    assigned_to_name = serializers.CharField(
        source='assigned_to.name', read_only=True)
    assigned_by_name = serializers.CharField(
        source='assigned_by.name', read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            'id', 'asset', 'asset_name', 'assigned_to', 'assigned_to_name',
            'assigned_by', 'assigned_by_name', 'assigned_date', 'returned_date', 'notes'
        ]
        read_only_fields = ['id', 'assigned_date']


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_assets = serializers.IntegerField()
    total_users = serializers.IntegerField()
    available_assets = serializers.IntegerField()
    assigned_assets = serializers.IntegerField()
    assets_in_repair = serializers.IntegerField()
    retired_assets = serializers.IntegerField()
    total_regions = serializers.IntegerField()
    assets_by_region = serializers.DictField()
    assets_by_type = serializers.DictField()
