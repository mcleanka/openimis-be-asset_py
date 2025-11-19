from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count

from .models import Region, User, Asset, DeviceType, AssetStatus, UserRole, AssetAssignment
from .serializers import (
    RegionSerializer, UserSerializer, AssetSerializer, AssetListSerializer,
    AssetDetailSerializer, DashboardStatsSerializer, AssetAssignmentSerializer,
    DeviceTypeSerializer, AssetStatusSerializer, UserRoleSerializer, AssetAssignmentListSerializer
)


class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all().prefetch_related('users', 'assets')
    serializer_class = RegionSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Optimize queryset based on action"""
        if self.action == 'list':
            return self.queryset.annotate(
                user_count=Count('users', distinct=True),
                asset_count=Count('assets', distinct=True)
            )
        return self.queryset

    def perform_destroy(self, instance):
        """Override delete to use model's validation"""
        try:
            instance.delete()
        except ValidationError as e:
            raise ValidationError({'detail': str(e)})

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get detailed statistics for a region"""
        region = self.get_object()
        stats = {
            'total_users': region.users.count(),
            'total_assets': region.assets.count(),
            'available_assets': region.assets.filter(status__code='available').count(),
            'assigned_assets': region.assets.filter(status__code='assigned').count(),
            'repair_assets': region.assets.filter(status__code='repair').count(),
            'retired_assets': region.assets.filter(status__code='retired').count(),
            'users_by_role': {
                role.name: region.users.filter(role=role).count()
                for role in UserRole.objects.all()
            }
        }
        return Response(stats)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related(
        'region', 'role')
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['region', 'role']
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'email', 'created_at']
    ordering = ['name']

    def get_query(self):
        queryset = self.queryset
        return queryset

    def perform_destroy(self, instance):
        """Soft delete by default, override for hard delete"""
        if self.request.query_params.get('hard_delete') == 'true':
            try:
                instance.delete()
            except ValidationError as e:
                raise ValidationError({'detail': str(e)})
        else:
            instance.is_active = False
            instance.save()

    @action(detail=True, methods=['get'])
    def assigned_assets(self, request, pk=None):
        """Get assets assigned to a user"""
        user = self.get_object()
        assets = user.assigned_assets.select_related(
            'device_type', 'status', 'region').all()
        serializer = AssetListSerializer(assets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_region(self, request):
        """Get users grouped by region"""
        regions = Region.objects.prefetch_related('users').all()
        data = {}
        for region in regions:
            users = region.users.all()
            data[region.name] = UserSerializer(users, many=True).data
        return Response(data)


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related(
        'region', 'assigned_to', 'device_type', 'status'
    ).prefetch_related('assignment_history')
    serializer_class = AssetSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'region', 'device_type', 'status', 'assigned_to',
    ]
    search_fields = [
        'name', 'assigned_to__name'
    ]
    ordering_fields = [
        'name', 'created_at', 'updated_at'
    ]
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return AssetListSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return AssetDetailSerializer
        return AssetSerializer

    def get_queryset(self):
        queryset = self.queryset

        status_code = self.request.query_params.get('status_code')
        if status_code:
            queryset = queryset.filter(status__code=status_code)

        if self.request.query_params.get('available') == 'true':
            queryset = queryset.filter(
                status__code='available', assigned_to__isnull=True)

        region_name = self.request.query_params.get('region_name')
        if region_name:
            queryset = queryset.filter(region__name__iexact=region_name)

        return queryset

    def perform_create(self, serializer):
        """Set default status if not provided"""
        if 'status' not in serializer.validated_data:
            default_status = AssetStatus.objects.filter(
                is_default=True).first()
            if default_status:
                serializer.validated_data['status'] = default_status
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign asset to a user with business logic and automatic audit trail"""
        asset = self.get_object()
        user_id = request.data.get('user_id')
        notes = request.data.get('notes', '')

        if not user_id:
            raise ValidationError({'user_id': 'This field is required.'})

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ValidationError({'user_id': 'User not found.'})

        try:
            asset.assign_to_user(user, notes)
            return Response({
                'success': True,
                'data': AssetSerializer(asset).data,
                'message': f'Asset {asset.name} assigned to {user.name}'
            })
        except ValidationError as e:
            raise ValidationError({'detail': str(e)})

    @action(detail=True, methods=['post'])
    def unassign(self, request, pk=None):
        """Unassign asset from current user with automatic audit trail"""
        asset = self.get_object()
        notes = request.data.get('notes', '')

        try:
            asset.unassign(notes)
            return Response({
                'success': True,
                'data': AssetSerializer(asset).data,
                'message': f'Asset {asset.name} unassigned'
            })
        except ValidationError as e:
            raise ValidationError({'detail': str(e)})

    @action(detail=True, methods=['post'])
    def mark_repair(self, request, pk=None):
        """Mark asset for repair with automatic audit trail"""
        asset = self.get_object()
        notes = request.data.get('notes', '')

        try:
            asset.mark_for_repair(notes)
            return Response({
                'success': True,
                'data': AssetSerializer(asset).data,
                'message': f'Asset {asset.name} marked for repair'
            })
        except ValidationError as e:
            raise ValidationError({'detail': str(e)})

    @action(detail=True, methods=['post'])
    def retire(self, request, pk=None):
        """Retire asset with automatic audit trail"""
        asset = self.get_object()
        notes = request.data.get('notes', '')

        try:
            asset.retire(notes)
            return Response({
                'success': True,
                'data': AssetSerializer(asset).data,
                'message': f'Asset {asset.name} retired'
            })
        except ValidationError as e:
            raise ValidationError({'detail': str(e)})

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        total_assets = Asset.objects.count()
        total_users = User.objects.count()
        available_assets = Asset.objects.filter(
            status__code='available').count()
        assigned_assets = Asset.objects.filter(status__code='assigned').count()
        assets_in_repair = Asset.objects.filter(status__code='repair').count()
        retired_assets = Asset.objects.filter(status__code='retired').count()
        total_regions = Region.objects.count()

        assets_by_region = {
            region.name: region.assets.count()
            for region in Region.objects.all()
        }

        assets_by_type = {
            device_type.name: device_type.assets.count()
            for device_type in DeviceType.objects.all()
        }

        data = {
            'total_assets': total_assets,
            'total_users': total_users,
            'available_assets': available_assets,
            'assigned_assets': assigned_assets,
            'assets_in_repair': assets_in_repair,
            'retired_assets': retired_assets,
            'total_regions': total_regions,
            'assets_by_region': assets_by_region,
            'assets_by_type': assets_by_type,
        }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)


class AssetAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for viewing asset assignment history.
    """
    queryset = AssetAssignment.objects.select_related(
        'asset',
        'assigned_to',
        'assignment_status',
        'assignment_region'
    ).all()
    serializer_class = AssetAssignmentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'asset',
        'assigned_to',
        'assignment_status',
        'assignment_region',
        'returned_date',
    ]
    search_fields = [
        'asset__name',
        'asset__serial_number',
        'assigned_to__name',
        'assigned_to__email',
    ]
    ordering_fields = [
        'assigned_date',
        'returned_date',
        'asset__name',
        'assigned_to__name',
    ]
    ordering = ['-assigned_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return AssetAssignmentListSerializer
        return AssetAssignmentSerializer

    def get_queryset(self):
        queryset = self.queryset

        active = self.request.query_params.get('active')
        if active == 'true':
            queryset = queryset.filter(returned_date__isnull=True)
        elif active == 'false':
            queryset = queryset.filter(returned_date__isnull=False)

        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(assigned_to_id=user_id)

        asset_id = self.request.query_params.get('asset_id')
        if asset_id:
            queryset = queryset.filter(asset_id=asset_id)

        return queryset

    @action(detail=False, methods=['get'])
    def current_assignments(self, request):
        """Get all currently active assignments"""
        active_assignments = self.get_queryset().filter(returned_date__isnull=True)
        page = self.paginate_queryset(active_assignments)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(active_assignments, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': len(serializer.data),
            'message': 'Current assignments retrieved successfully'
        })


class DeviceTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for device types"""
    queryset = DeviceType.objects.filter(is_active=True)
    serializer_class = DeviceTypeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AssetStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for asset statuses"""
    queryset = AssetStatus.objects.filter(is_active_state=True)
    serializer_class = AssetStatusSerializer
    filter_backends = [OrderingFilter]
    ordering_fields = ['name']
    ordering = ['name']


class UserRoleViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for user roles"""
    queryset = UserRole.objects.filter(is_active=True)
    serializer_class = UserRoleSerializer
    filter_backends = [OrderingFilter]
    ordering_fields = ['name']
    ordering = ['name']
