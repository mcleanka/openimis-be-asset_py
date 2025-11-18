#!/usr/bin/env python
"""
Seed script to populate the database with initial data.
Run with: python seed_data.py
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from assets.models import Region, User, Asset, AssetStatus, DeviceType, UserRole


def seed_data():
    print("Starting data seeding...")

    # Clear existing data
    print("Clearing existing data...")
    Asset.objects.all().delete()
    User.objects.all().delete()
    Region.objects.all().delete()

    # Device Types
    device_types_data = [
        ('Phone', 'phone'),
        ('Tablet', 'tablet'),
    ]
    device_types = {}
    for name, code in device_types_data:
        device_type, _ = DeviceType.objects.get_or_create(
            code=code, defaults={'name': name})
        device_types[code] = device_type
        print(f"  Created device type: {name}")

    # Asset Statuses
    print("Creating asset statuses...")
    asset_statuses_data = [
        ('Available', 'available', True, True),
        ('Assigned', 'assigned', False, False),
        ('In Repair', 'repair', False, False),
        ('Retired', 'retired', False, False),
    ]
    asset_statuses = {}
    for name, code, can_assign, is_default in asset_statuses_data:
        asset_status, _ = AssetStatus.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'can_assign': can_assign,
                'is_default': is_default
            }
        )
        asset_statuses[code] = asset_status
        print(f"  Created asset status: {name}")

    # User Roles
    print("Creating user roles...")
    user_roles_data = [
        ('Admin', 'admin', False),
        ('Supervisor', 'supervisor', False),
        ('User', 'user', True),
    ]
    user_roles = {}
    for name, code, is_default in user_roles_data:
        user_role, _ = UserRole.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'is_default': is_default
            }
        )
        user_roles[code] = user_role
        print(f"  Created user rolec: {name}")

    # Create Regions
    print("Creating regions...")
    regions_data = ['North', 'South', 'East', 'West', 'Central']
    regions = {}
    for region_name in regions_data:
        region = Region.objects.create(name=region_name)
        regions[region_name] = region
        print(f"  Created region: {region_name}")

    # Create Users
    print("Creating users...")
    users_data = [
        {
            'name': 'John Admin',
            'email': 'admin@example.com',
            'role': user_roles['admin'],
            'region': regions['Central']
        },
        {
            'name': 'Jane Supervisor',
            'email': 'supervisor@example.com',
            'role': user_roles['supervisor'],
            'region': regions['North']
        },
        {
            'name': 'Bob User',
            'email': 'user@example.com',
            'role': user_roles['user'],
            'region': regions['South']
        }
    ]

    users = {}
    for user_data in users_data:
        user = User.objects.create(**user_data)
        users[user_data['name']] = user
        print(f"  Created user: {user_data['name']}")

    # Create Assets
    print("Creating assets...")
    assets_data = [
        {
            'name': 'iPhone 14',
            'serial_number': 'ASSET001',
            'region': regions['East']
        },
        {
            'name': 'Galaxy Tab',
            'serial_number': 'ASSET002',
            'region': regions['South']
        }
    ]

    for asset_data in assets_data:
        asset = Asset.objects.create(**asset_data)
        print(
            f"  Created asset: {asset_data['name']} ({asset_data['serial_number']})")

    print("\nData seeding completed successfully!")
    print(f"Created {Region.objects.count()} regions")
    print(f"Created {User.objects.count()} users")
    print(f"Created {Asset.objects.count()} assets")
    print(f"Created {UserRole.objects.count()} user roles")
    print(f"Created {DeviceType.objects.count()} device types")
    print(f"Created {AssetStatus.objects.count()} asset statuses")


if __name__ == '__main__':
    seed_data()
