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

        cls.lost = AssetStatus(
            code="lost", name="Lost", can_assign=False,
        )
        cls.lost.save(username=cls.user.username)

        cls.repair = AssetStatus(
            code="repair", name="Repair", can_assign=False,
        )
        cls.repair.save(username=cls.user.username)

        cls.retired = AssetStatus(
            code="retired", name="Retired", can_assign=False,
        )
        cls.retired.save(username=cls.user.username)

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

    # ---- Device details tests ----

    def test_create_asset_with_device_details(self):
        asset = services.create_asset(user=self.user, data={
            "name": "Samsung Galaxy S24",
            "serial_number": "TST-DEV-001",
            "device_type": self.phone,
            "status": self.available,
            "location": self.location,
            "imei": "123456789012345",
            "manufacturer": "Samsung",
            "model": "Galaxy S24",
            "os_version": "Android 14",
        })
        self.assertEqual(asset.imei, "123456789012345")
        self.assertEqual(asset.manufacturer, "Samsung")
        self.assertEqual(asset.model, "Galaxy S24")
        self.assertEqual(asset.os_version, "Android 14")

    def test_create_asset_device_details_default_empty(self):
        asset = self._make_asset(serial="TST-DEV-002")
        self.assertEqual(asset.imei, "")
        self.assertEqual(asset.manufacturer, "")
        self.assertEqual(asset.model, "")
        self.assertEqual(asset.os_version, "")

    def test_update_asset_device_details(self):
        asset = self._make_asset(serial="TST-DEV-003")
        services.update_asset(user=self.user, asset=asset, data={
            "imei": "999888777666555",
            "manufacturer": "Apple",
            "model": "iPhone 16",
            "os_version": "iOS 18",
        })
        asset.refresh_from_db()
        self.assertEqual(asset.imei, "999888777666555")
        self.assertEqual(asset.manufacturer, "Apple")
        self.assertEqual(asset.model, "iPhone 16")
        self.assertEqual(asset.os_version, "iOS 18")

    # ---- Lost status tests ----

    def test_mark_lost_unassigned_asset(self):
        asset = self._make_asset(serial="TST-LOST-001")
        errs = services.mark_lost(user=self.user, asset=asset, notes="left on bus")
        asset.refresh_from_db()
        self.assertEqual(errs, [])
        self.assertEqual(asset.status.code, "lost")
        self.assertIsNone(asset.assigned_to_id)

    def test_mark_lost_assigned_asset_closes_assignment(self):
        asset = self._make_asset(serial="TST-LOST-002")
        services.assign_asset(user=self.user, asset=asset, holder=self.user)
        asset.refresh_from_db()
        self.assertIsNotNone(asset.assigned_to_id)

        errs = services.mark_lost(user=self.user, asset=asset, notes="stolen")
        asset.refresh_from_db()
        self.assertEqual(errs, [])
        self.assertEqual(asset.status.code, "lost")
        self.assertIsNone(asset.assigned_to_id)

        active = asset.assignment_history.filter(returned_date__isnull=True)
        self.assertFalse(active.exists())

    # ---- Mark for repair tests ----

    def test_mark_for_repair(self):
        asset = self._make_asset(serial="TST-RPR-001")
        errs = services.mark_for_repair(user=self.user, asset=asset, notes="cracked screen")
        asset.refresh_from_db()
        self.assertEqual(errs, [])
        self.assertEqual(asset.status.code, "repair")
        self.assertIsNone(asset.assigned_to_id)

    # ---- Retire tests ----

    def test_retire_asset(self):
        asset = self._make_asset(serial="TST-RET-001")
        errs = services.retire_asset(user=self.user, asset=asset, notes="end of life")
        asset.refresh_from_db()
        self.assertEqual(errs, [])
        self.assertEqual(asset.status.code, "retired")
        self.assertIsNone(asset.assigned_to_id)

    # ---- Delete tests ----

    def test_delete_asset(self):
        asset = self._make_asset(serial="TST-DEL-001")
        errs = services.delete_asset(user=self.user, asset=asset)
        self.assertEqual(errs, [])
        asset.refresh_from_db()
        self.assertTrue(asset.is_deleted)

    def test_delete_assigned_asset_blocked(self):
        asset = self._make_asset(serial="TST-DEL-002")
        services.assign_asset(user=self.user, asset=asset, holder=self.user)
        asset.refresh_from_db()

        errs = services.delete_asset(user=self.user, asset=asset)
        self.assertTrue(errs)
        self.assertEqual(errs[0]["message"], "asset.validation.delete_while_assigned")
