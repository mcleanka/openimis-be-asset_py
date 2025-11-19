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


class DeviceTypeTests(TestCase):
    def test_device_type_creation(self):
        """Test creating a device type"""
        from .models import DeviceType
        device_type = DeviceType.objects.create(name="Laptop")
        self.assertEqual(device_type.name, "Laptop")
        self.assertIsNotNone(device_type.created_at)

    def test_device_type_string_representation(self):
        """Test device type string representation"""
        from .models import DeviceType
        device_type = DeviceType.objects.create(name="Tablet")
        self.assertEqual(str(device_type), "Tablet")


class UserRoleTests(TestCase):
    def test_user_role_creation(self):
        """Test creating a user role"""
        from .models import UserRole
        role = UserRole.objects.create(name="Administrator")
        self.assertEqual(role.name, "Administrator")
        self.assertIsNotNone(role.created_at)

    def test_user_role_string_representation(self):
        """Test user role string representation"""
        from .models import UserRole
        role = UserRole.objects.create(name="Technician")
        self.assertEqual(str(role), "Technician")


class AssetStatusTests(TestCase):
    def test_asset_status_creation(self):
        """Test creating an asset status"""
        from .models import AssetStatus
        status_obj = AssetStatus.objects.create(
            name="In Repair", code="in_repair")
        self.assertEqual(status_obj.name, "In Repair")
        self.assertEqual(status_obj.code, "in_repair")
        self.assertIsNotNone(status_obj.created_at)

    def test_asset_status_string_representation(self):
        """Test asset status string representation"""
        from .models import AssetStatus
        status_obj = AssetStatus.objects.create(
            name="Decommissioned", code="decommissioned")
        self.assertEqual(str(status_obj), "Decommissioned")


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
