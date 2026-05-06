from django.contrib import admin

from .models import Asset, AssetAssignment, AssetStatus, DeviceType


@admin.register(DeviceType)
class DeviceTypeAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_deleted")
    search_fields = ("code", "name")


@admin.register(AssetStatus)
class AssetStatusAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "can_assign", "is_default", "is_deleted")
    search_fields = ("code", "name")


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        "name", "serial_number", "device_type", "status",
        "location", "assigned_to", "is_deleted",
    )
    list_filter = ("status", "device_type", "location")
    search_fields = ("name", "serial_number")


@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "asset", "assigned_to", "assigned_by",
        "assigned_date", "returned_date",
    )
    list_filter = ("snapshot_status", "snapshot_location")
