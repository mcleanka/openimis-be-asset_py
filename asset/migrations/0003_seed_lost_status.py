import uuid

from django.conf import settings
from django.db import migrations


LOST_STATUS = {
    "code": "lost",
    "name": "Lost",
    "description": "Asset reported lost or stolen.",
    "can_assign": False,
    "is_default": False,
}


def _system_user(apps):
    User = apps.get_model(*settings.AUTH_USER_MODEL.split("."))
    return (
        User.objects.filter(is_superuser=True).first()
        or User.objects.order_by("date_joined").first()
    )


def seed_lost_status(apps, schema_editor):
    AssetStatus = apps.get_model("asset", "AssetStatus")
    if AssetStatus.objects.filter(code=LOST_STATUS["code"]).exists():
        return

    user = _system_user(apps)
    if not user:
        # No users available yet; the row can be added later by a separate
        # data-seed step. Skip silently to keep migrations idempotent.
        return

    AssetStatus.objects.create(
        id=uuid.uuid4(),
        code=LOST_STATUS["code"],
        name=LOST_STATUS["name"],
        description=LOST_STATUS["description"],
        can_assign=LOST_STATUS["can_assign"],
        is_default=LOST_STATUS["is_default"],
        is_deleted=False,
        user_created=user,
        user_updated=user,
    )


def remove_lost_status(apps, schema_editor):
    AssetStatus = apps.get_model("asset", "AssetStatus")
    AssetStatus.objects.filter(code=LOST_STATUS["code"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("asset", "0002_asset_device_details"),
    ]

    operations = [
        migrations.RunPython(seed_lost_status, remove_lost_status),
    ]
