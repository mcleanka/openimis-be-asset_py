"""Service-layer tests for the asset module.

These run inside an openIMIS assembly via ``python manage.py test asset``.
"""
from django.test import TestCase

from core.models import User
from location.models import Location

from asset import services
from asset.models import Asset, AssetStatus, DeviceType


class AssetLifecycleTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User(username="asset_test_admin")
        cls.user.save()

        cls.location = Location.objects.create(
            code="TST-R", name="Test Region", type="R",
        )

        cls.phone = DeviceType(code="phone", name="Phone")
        cls.phone.save(username=cls.user.username)

        cls.available = AssetStatus(
            code="available", name="Available",
            can_assign=True, is_default=True,
        )
        cls.available.save(username=cls.user.username)

        cls.assigned = AssetStatus(
            code="assigned", name="Assigned", can_assign=False,
        )
        cls.assigned.save(username=cls.user.username)

    def _make_asset(self, serial="TST-001"):
        return services.create_asset(user=self.user, data={
            "name": "iPhone 15",
            "serial_number": serial,
            "device_type": self.phone,
            "status": self.available,
            "location": self.location,
        })

    def test_default_lookups(self):
        self.assertEqual(services._default_status().code, "available")
        self.assertEqual(services._default_device_type().code, "phone")

    def test_create_asset(self):
        asset = self._make_asset()
        self.assertIsNotNone(asset.id)
        self.assertEqual(asset.status.code, "available")
        self.assertIsNone(asset.assigned_to_id)

    def test_assign_then_unassign(self):
        asset = self._make_asset(serial="TST-002")

        errs = services.assign_asset(
            user=self.user, asset=asset, holder=self.user, notes="t",
        )
        asset.refresh_from_db()
        self.assertEqual(errs, [])
        self.assertEqual(asset.status.code, "assigned")
        self.assertEqual(asset.assigned_to_id, self.user.id)
        self.assertEqual(asset.assignment_history.count(), 1)

        errs = services.unassign_asset(
            user=self.user, asset=asset, notes="returned",
        )
        asset.refresh_from_db()
        self.assertEqual(errs, [])
        self.assertEqual(asset.status.code, "available")
        self.assertIsNone(asset.assigned_to_id)

        active = asset.assignment_history.filter(returned_date__isnull=True)
        self.assertFalse(active.exists())

    def test_assign_blocked_when_already_assigned(self):
        asset = self._make_asset(serial="TST-003")
        services.assign_asset(user=self.user, asset=asset, holder=self.user)
        asset.refresh_from_db()

        errs = services.assign_asset(
            user=self.user, asset=asset, holder=self.user,
        )
        self.assertTrue(errs)
        # Either rule may fire first: status no longer can_assign,
        # or the asset already has a holder.
        messages = {e["message"] for e in errs}
        self.assertTrue(
            messages & {
                "asset.validation.not_assignable",
                "asset.validation.already_assigned",
            },
            f"unexpected errors: {errs}",
        )
