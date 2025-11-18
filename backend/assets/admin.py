from django.contrib import admin
from .models import Region, User, Asset


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at']
    search_fields = ['name']


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'created_at']
    search_fields = ['name', 'email']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'serial_number', 'region', 'created_at']
    list_filter = ['region']
    search_fields = ['name', 'serial_number']
