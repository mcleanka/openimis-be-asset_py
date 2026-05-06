from django.conf import settings
from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .views import (
    RegionViewSet, UserViewSet, AssetViewSet,
    DeviceTypeViewSet, AssetStatusViewSet, UserRoleViewSet,
    AssetAssignmentViewSet
)

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

router.register('regions', RegionViewSet)
router.register('users', UserViewSet)
router.register('assets', AssetViewSet)
router.register('device-types', DeviceTypeViewSet, basename='devicetype')
router.register('asset-statuses', AssetStatusViewSet, basename='assetstatus')
router.register('user-roles', UserRoleViewSet, basename='userrole')
router.register('asset-assignments', AssetAssignmentViewSet,
                basename='asset-assignment')

urlpatterns = [
    path('', include(router.urls)),

    # Asset custom actions
    path('assets/<int:pk>/assign/',
         AssetViewSet.as_view({'post': 'assign'}), name='asset-assign'),
    path('assets/<int:pk>/unassign/',
         AssetViewSet.as_view({'post': 'unassign'}), name='asset-unassign'),
    path('assets/<int:pk>/mark-repair/',
         AssetViewSet.as_view({'post': 'mark_repair'}), name='asset-mark-repair'),
    path('assets/<int:pk>/retire/',
         AssetViewSet.as_view({'post': 'retire'}), name='asset-retire'),

    # User custom actions
    path('users/<int:pk>/assigned-assets/',
         UserViewSet.as_view({'get': 'assigned_assets'}), name='user-assigned-assets'),
    path('users/by-region',
         UserViewSet.as_view({'get': 'by_region'}), name='users-by-region'),

    # Region custom actions
    path('regions/<int:pk>/stats/',
         RegionViewSet.as_view({'get': 'stats'}), name='region-stats'),

    # Analytics
    path('dashboard/stats/',
         AssetViewSet.as_view({'get': 'dashboard_stats'}), name='dashboard-stats'),
]
