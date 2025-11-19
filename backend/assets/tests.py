from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Region, User, Asset


class RegionModelTests(TestCase):
    def test_create_region(self):
        """Test creating a region"""
        region = Region.objects.create(name="Test Region")
        self.assertEqual(region.name, "Test Region")
        self.assertIsNotNone(region.created_at)

    def test_region_string_representation(self):
        """Test region string representation"""
        region = Region.objects.create(name="North")
        self.assertEqual(str(region), "North")


class UserModelTests(TestCase):
    def test_create_user(self):
        """Test creating a user"""
        user = User.objects.create(
            name="Test User",
            email="test@example.com"
        )
        self.assertEqual(user.name, "Test User")
        self.assertEqual(user.email, "test@example.com")
        self.assertIsNotNone(user.created_at)

    def test_user_string_representation(self):
        """Test user string representation"""
        user = User.objects.create(name="John Doe", email="john@example.com")
        self.assertEqual(str(user), "John Doe")


class AssetModelTests(TestCase):
    def setUp(self):
        self.region = Region.objects.create(name="Test Region")

    def test_create_asset(self):
        """Test creating an asset"""
        asset = Asset.objects.create(
            name="Test Device",
            serial_number="TEST001",
            region=self.region
        )
        self.assertEqual(asset.name, "Test Device")
        self.assertEqual(asset.serial_number, "TEST001")
        self.assertEqual(asset.region, self.region)
        self.assertIsNotNone(asset.created_at)
        self.assertIsNotNone(asset.updated_at)

    def test_asset_string_representation(self):
        """Test asset string representation"""
        asset = Asset.objects.create(
            name="iPhone 14",
            serial_number="ASSET001",
            region=self.region
        )
        self.assertEqual(str(asset), "iPhone 14 (ASSET001)")


class RegionAPITests(APITestCase):
    def test_list_regions(self):
        """Test listing all regions"""
        Region.objects.create(name="North")
        Region.objects.create(name="South")

        response = self.client.get('/api/regions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_region(self):
        """Test creating a region via API"""
        data = {'name': 'East'}
        response = self.client.post('/api/regions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Region.objects.count(), 1)
        self.assertEqual(Region.objects.get().name, 'East')

    def test_retrieve_region(self):
        """Test retrieving a single region"""
        region = Region.objects.create(name="West")
        response = self.client.get(f'/api/regions/{region.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'West')

    def test_update_region(self):
        """Test updating a region"""
        region = Region.objects.create(name="Central")
        data = {'name': 'Central Updated'}
        response = self.client.put(f'/api/regions/{region.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        region.refresh_from_db()
        self.assertEqual(region.name, 'Central Updated')

    def test_delete_region(self):
        """Test deleting a region"""
        region = Region.objects.create(name="Test")
        response = self.client.delete(f'/api/regions/{region.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Region.objects.count(), 0)


class UserAPITests(APITestCase):
    def test_list_users(self):
        """Test listing all users"""
        User.objects.create(name="User 1", email="user1@example.com")
        User.objects.create(name="User 2", email="user2@example.com")

        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_user(self):
        """Test creating a user via API"""
        data = {'name': 'New User', 'email': 'new@example.com'}
        response = self.client.post('/api/users/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().name, 'New User')

    def test_retrieve_user(self):
        """Test retrieving a single user"""
        user = User.objects.create(name="Test User", email="test@example.com")
        response = self.client.get(f'/api/users/{user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test User')

    def test_update_user(self):
        """Test updating a user"""
        user = User.objects.create(name="Old Name", email="old@example.com")
        data = {'name': 'New Name', 'email': 'new@example.com'}
        response = self.client.put(f'/api/users/{user.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.name, 'New Name')

    def test_delete_user(self):
        """Test deleting a user"""
        user = User.objects.create(name="Test", email="test@example.com")
        response = self.client.delete(f'/api/users/{user.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.count(), 0)


class AssetAPITests(APITestCase):
    def setUp(self):
        self.region = Region.objects.create(name="Test Region")

    def test_list_assets(self):
        """Test listing all assets"""
        Asset.objects.create(
            name="Asset 1", serial_number="A001", region=self.region)
        Asset.objects.create(
            name="Asset 2", serial_number="A002", region=self.region)

        response = self.client.get('/api/assets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_asset(self):
        """Test creating an asset via API"""
        data = {
            'name': 'New Asset',
            'serial_number': 'NEW001',
            'region': self.region.id
        }
        response = self.client.post('/api/assets/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Asset.objects.count(), 1)
        self.assertEqual(Asset.objects.get().name, 'New Asset')

    def test_retrieve_asset(self):
        """Test retrieving a single asset"""
        asset = Asset.objects.create(
            name="Test Asset",
            serial_number="TEST001",
            region=self.region
        )
        response = self.client.get(f'/api/assets/{asset.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Asset')

    def test_update_asset(self):
        """Test updating an asset"""
        asset = Asset.objects.create(
            name="Old Name",
            serial_number="OLD001",
            region=self.region
        )
        data = {
            'name': 'New Name',
            'serial_number': 'NEW001',
            'region': self.region.id
        }
        response = self.client.put(f'/api/assets/{asset.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        asset.refresh_from_db()
        self.assertEqual(asset.name, 'New Name')

    def test_delete_asset(self):
        """Test deleting an asset"""
        asset = Asset.objects.create(
            name="Test",
            serial_number="TEST001",
            region=self.region
        )
        response = self.client.delete(f'/api/assets/{asset.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Asset.objects.count(), 0)

# New Tests


class DeviceTypeAPITests(APITestCase):
    def test_list_device_types(self):
        """Test listing all device types"""
        from .models import DeviceType
        DeviceType.objects.create(name="Laptop", code="laptop")
        DeviceType.objects.create(name="Phone", code="phone")

        response = self.client.get('/api/device-types/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_device_type(self):
        """Test creating a device type via API"""
        from .models import DeviceType
        data = {'name': 'Tablet', 'code': 'tablet',
                'description': 'Mobile Tablet'}
        response = self.client.post('/api/device-types/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DeviceType.objects.count(), 1)
        self.assertEqual(DeviceType.objects.get().name, 'Tablet')

    def test_retrieve_device_type(self):
        """Test retrieving a single device type"""
        from .models import DeviceType
        device_type = DeviceType.objects.create(name="Desktop", code="desktop")
        response = self.client.get(f'/api/device-types/{device_type.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Desktop')

    def test_update_device_type(self):
        """Test updating a device type"""
        from .models import DeviceType
        device_type = DeviceType.objects.create(name="Monitor", code="monitor")
        data = {'name': 'Display Monitor',
                'code': 'display_monitor', 'is_active': False}
        response = self.client.put(
            f'/api/device-types/{device_type.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        device_type.refresh_from_db()
        self.assertEqual(device_type.name, 'Display Monitor')

    def test_delete_device_type(self):
        """Test deleting a device type"""
        from .models import DeviceType
        device_type = DeviceType.objects.create(
            name="Test Device", code="test_device")
        response = self.client.delete(f'/api/device-types/{device_type.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(DeviceType.objects.count(), 0)


class UserRoleAPITests(APITestCase):
    def test_list_user_roles(self):
        """Test listing all user roles"""
        from .models import UserRole
        UserRole.objects.create(name="Admin", code="admin")
        UserRole.objects.create(name="User", code="user")

        response = self.client.get('/api/user-roles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_user_role(self):
        """Test creating a user role via API"""
        from .models import UserRole
        data = {'name': 'Technician', 'code': 'technician', 'permissions': {}}
        response = self.client.post('/api/user-roles/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserRole.objects.count(), 1)
        self.assertEqual(UserRole.objects.get().name, 'Technician')

    def test_retrieve_user_role(self):
        """Test retrieving a single user role"""
        from .models import UserRole
        role = UserRole.objects.create(name="Manager", code="manager")
        response = self.client.get(f'/api/user-roles/{role.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Manager')

    def test_update_user_role(self):
        """Test updating a user role"""
        from .models import UserRole
        role = UserRole.objects.create(name="Viewer", code="viewer")
        data = {'name': 'Viewer Updated', 'code': 'viewer', 'is_active': True}
        response = self.client.put(f'/api/user-roles/{role.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        role.refresh_from_db()
        self.assertEqual(role.name, 'Viewer Updated')

    def test_delete_user_role(self):
        """Test deleting a user role"""
        from .models import UserRole
        role = UserRole.objects.create(name="Test Role", code="test_role")
        response = self.client.delete(f'/api/user-roles/{role.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserRole.objects.count(), 0)


class AssetStatusAPITests(APITestCase):
    def test_list_asset_statuses(self):
        """Test listing all asset statuses"""
        from .models import AssetStatus
        AssetStatus.objects.create(name="Available", code="available")
        AssetStatus.objects.create(name="Assigned", code="assigned")

        response = self.client.get('/api/asset-statuses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_asset_status(self):
        """Test creating an asset status via API"""
        from .models import AssetStatus
        data = {'name': 'In Repair', 'code': 'in_repair', 'can_assign': False}
        response = self.client.post('/api/asset-statuses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AssetStatus.objects.count(), 1)

    def test_retrieve_asset_status(self):
        """Test retrieving a single asset status"""
        from .models import AssetStatus
        status_obj = AssetStatus.objects.create(name="Retired", code="retired")
        response = self.client.get(f'/api/asset-statuses/{status_obj.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Retired')

    def test_update_asset_status(self):
        """Test updating an asset status"""
        from .models import AssetStatus
        status_obj = AssetStatus.objects.create(name="Lost", code="lost")
        data = {'name': 'Lost and Found',
                'code': 'lost_and_found', 'can_assign': False}
        response = self.client.put(
            f'/api/asset-statuses/{status_obj.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        status_obj.refresh_from_db()
        self.assertEqual(status_obj.name, 'Lost and Found')

    def test_delete_asset_status(self):
        """Test deleting an asset status"""
        from .models import AssetStatus
        status_obj = AssetStatus.objects.create(
            name="Test Status", code="test_status")
        response = self.client.delete(f'/api/asset-statuses/{status_obj.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(AssetStatus.objects.count(), 0)


class AssetAssignmentTests(APITestCase):
    def setUp(self):
        self.region = Region.objects.create(name="Test Region")
        self.user = User.objects.create(
            name="Test User", email="testuser@example.com")
        self.asset = Asset.objects.create(
            name="Test Asset",
            serial_number="TEST001",
            region=self.region
        )

    def test_list_asset_assignments(self):
        """Test listing all asset assignments"""
        from .models import AssetAssignment
        AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
            assignment_region=self.region
        )
        response = self.client.get('/api/asset-assignments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_asset_assignment(self):
        """Test creating an asset assignment via API"""
        from .models import AssetAssignment
        data = {
            'asset': self.asset.id,
            'assigned_to': self.user.id,
            'assignment_region': self.region.id
        }
        response = self.client.post('/api/asset-assignments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AssetAssignment.objects.count(), 1)

    def test_retrieve_asset_assignment(self):
        """Test retrieving a single asset assignment"""
        from .models import AssetAssignment
        assignment = AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
            assignment_region=self.region
        )
        response = self.client.get(f'/api/asset-assignments/{assignment.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['asset'], self.asset.id)

    def test_update_asset_assignment(self):
        """Test updating an asset assignment (return asset)"""
        from .models import AssetAssignment
        assignment = AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
            assignment_region=self.region
        )
        self.assertIsNone(assignment.returned_date)

        data = {
            'asset': self.asset.id,
            'assigned_to': self.user.id,
            'assignment_region': self.region.id,
            'returned_date': '2025-01-15'
        }
        response = self.client.put(
            f'/api/asset-assignments/{assignment.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assignment.refresh_from_db()
        self.assertIsNotNone(assignment.returned_date)

    def test_delete_asset_assignment(self):
        """Test deleting an asset assignment"""
        from .models import AssetAssignment
        assignment = AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
            assignment_region=self.region
        )
        response = self.client.delete(
            f'/api/asset-assignments/{assignment.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(AssetAssignment.objects.count(), 0)


class AssetCustomActionsTests(APITestCase):
    def setUp(self):
        from .models import AssetStatus, DeviceType
        self.region = Region.objects.create(name="Test Region")
        self.user = User.objects.create(
            name="Test User", email="testuser@example.com")
        self.available_status = AssetStatus.objects.create(
            name="Available", code="available", can_assign=True, is_default=True)
        self.assigned_status = AssetStatus.objects.create(
            name="Assigned", code="assigned", can_assign=False)
        self.repair_status = AssetStatus.objects.create(
            name="In Repair", code="in_repair", can_assign=False)
        self.retired_status = AssetStatus.objects.create(
            name="Retired", code="retired", can_assign=False)
        self.device_type = DeviceType.objects.create(
            name="Laptop", code="laptop")
        self.asset = Asset.objects.create(
            name="Test Asset",
            serial_number="TEST001",
            region=self.region,
            device_type=self.device_type,
            status=self.available_status
        )

    def test_assign_asset(self):
        """Test assigning an asset to a user"""
        data = {'assigned_to': self.user.id}
        response = self.client.post(
            f'/api/assets/{self.asset.id}/assign/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.asset.refresh_from_db()
        from .models import AssetAssignment
        assignments = AssetAssignment.objects.filter(asset=self.asset)
        self.assertEqual(assignments.count(), 1)

    def test_unassign_asset(self):
        """Test unassigning an asset from a user"""
        from .models import AssetAssignment
        assignment = AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
            assignment_region=self.region
        )
        response = self.client.post(
            f'/api/assets/{self.asset.id}/unassign/', {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assignment.refresh_from_db()
        self.assertIsNotNone(assignment.returned_date)

    def test_mark_asset_repair(self):
        """Test marking an asset as in repair"""
        response = self.client.post(
            f'/api/assets/{self.asset.id}/mark-repair/', {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.asset.refresh_from_db()
        self.assertEqual(self.asset.status, self.repair_status)

    def test_retire_asset(self):
        """Test retiring an asset"""
        response = self.client.post(f'/api/assets/{self.asset.id}/retire/', {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.asset.refresh_from_db()
        self.assertEqual(self.asset.status, self.retired_status)

    def test_dashboard_stats(self):
        """Test getting dashboard statistics"""
        response = self.client.get('/api/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_assets', response.data)
        self.assertIn('total_users', response.data)
        self.assertIn('total_regions', response.data)
        self.assertIn('assigned_assets', response.data)


class UserCustomActionsTests(APITestCase):
    def setUp(self):
        self.region_north = Region.objects.create(name="North")
        self.region_south = Region.objects.create(name="South")
        self.user1 = User.objects.create(
            name="User 1", email="user1@example.com", region=self.region_north)
        self.user2 = User.objects.create(
            name="User 2", email="user2@example.com", region=self.region_south)

    def test_assigned_assets(self):
        """Test getting assigned assets for a user"""
        response = self.client.get(
            f'/api/users/{self.user1.id}/assigned-assets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_users_by_region(self):
        """Test getting users grouped by region"""
        response = self.client.get('/api/users/by-region/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class RegionCustomActionsTests(APITestCase):
    def setUp(self):
        self.region = Region.objects.create(name="Test Region")
        self.user = User.objects.create(
            name="Test User", email="testuser@example.com", region=self.region)
        self.asset = Asset.objects.create(
            name="Test Asset", serial_number="TEST001", region=self.region)

    def test_region_stats(self):
        """Test getting region statistics"""
        response = self.client.get(f'/api/regions/{self.region.id}/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('total_assets', response.data)
