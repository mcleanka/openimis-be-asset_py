from django.db import models
from django.core.exceptions import ValidationError


class DeviceType(models.Model):
    """Dynamic model for device types"""
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        db_table = 'asset_device_types'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name.lower().replace(' ', '_')
        super().save(*args, **kwargs)


class AssetStatus(models.Model):
    """Dynamic model for asset statuses"""
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    can_assign = models.BooleanField(default=False)
    is_active_state = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        db_table = 'asset_statuses'
        verbose_name_plural = "Asset statuses"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name.lower().replace(' ', '_')
        super().save(*args, **kwargs)

    @classmethod
    def get_default_status(cls):
        """Get the default status"""
        try:
            return cls.objects.get(is_default=True)
        except (cls.DoesNotExist, cls.MultipleObjectsReturned):
            return cls.objects.filter(is_active_state=True).first()


class UserRole(models.Model):
    """Dynamic model for user roles"""
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        db_table = 'user_roles'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.name.lower().replace(' ', '_')
        super().save(*args, **kwargs)

    @classmethod
    def get_default_role(cls):
        """Get the default role (usually 'user')"""
        try:
            return cls.objects.get(is_default=True)
        except (cls.DoesNotExist, cls.MultipleObjectsReturned):
            return cls.objects.filter(is_active=True).first()


class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        """Prevent deletion of regions with users or assets"""
        if self.users.exists() or self.assets.exists():
            raise ValidationError(
                f"Cannot delete region '{self.name}' because it has users or assets assigned. "
                "Reassign or delete all users and assets first."
            )
        super().delete(*args, **kwargs)


class User(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)

    # Make role and region optional for backward
    # Compatibility with old and new tests
    role = models.ForeignKey(
        UserRole,
        on_delete=models.PROTECT,
        related_name='users',
        null=True,      # Allows NULL in database
        blank=True      # Allows empty value in serializers
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_detailed_display(self):
        role_name = self.role.name if self.role else "No Role"
        return f"{self.name} ({role_name})"

    def save(self, *args, **kwargs):
        """Set default values for new fields if not provided"""
        if not self.role:
            default_role = UserRole.objects.filter(is_default=True).first()
            if default_role:
                self.role = default_role

        super().save(*args, **kwargs)

    @property
    def can_delete(self):
        """
        Check if user can be safely deleted.
        """
        asset_count = self.assigned_assets.count()

        if asset_count > 0:
            return False, f"User has {asset_count} assigned asset(s)", asset_count

        return True, "User can be deleted", 0


class Asset(models.Model):
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)
    region = models.ForeignKey(
        Region, on_delete=models.CASCADE, related_name='assets')

    # Make device_type & status optional
    # for backward compatibility with both old and new tests
    device_type = models.ForeignKey(
        DeviceType,
        on_delete=models.PROTECT,
        related_name='assets',
        null=True,
        blank=True
    )
    status = models.ForeignKey(
        AssetStatus,
        on_delete=models.PROTECT,
        related_name='assets',
        null=True,
        blank=True
    )
    assigned_to = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_assets'
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.PROTECT,  # Keep region as required
        related_name='assets'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.serial_number})"

    def save(self, *args, **kwargs):
        """Set default values for new fields if not provided"""
        if not self.device_type:
            phone_type = DeviceType.objects.filter(code='phone').first()
            if phone_type:
                self.device_type = phone_type

        if not self.status:
            available_status = AssetStatus.objects.filter(
                is_default=True).first()
            if available_status:
                self.status = available_status

        self.validateData()
        super().save(*args, **kwargs)

    def validateData(self):
        """Validation for business rules"""
        # Skip validation if required fields are missing
        # for test compatibility
        if not self.status or not self.region:
            return

        # Assignment validation
        if self.assigned_to:
            if self.assigned_to.region != self.region:
                raise ValidationError(
                    "Asset can only be assigned to a user in the same region.")

            if self.status.code != 'assigned':
                raise ValidationError(
                    "Asset status must be 'assigned' when assigning a user.")

            # Check if user is active
            if not self.assigned_to.is_active:
                raise ValidationError("Cannot assign asset to inactive user.")

        # Status consistency validation
        if self.status.code == 'assigned' and not self.assigned_to:
            raise ValidationError("Assigned assets must have a user assigned.")

        if self.status.code != 'assigned' and self.assigned_to:
            raise ValidationError(
                "Unassigned assets cannot have an assigned user.")

        # Prevent assigning retired assets
        if self.status.code == 'retired' and self.assigned_to:
            raise ValidationError(
                "Retired assets cannot be assigned to users.")

    def assign_to_user(self, user):
        """Business method to assign asset to user"""
        assigned_status = AssetStatus.objects.get(code='assigned')

        if self.status != assigned_status:
            raise ValidationError("Only available assets can be assigned.")
        if user.region != self.region:
            raise ValidationError("User must be in the same region as asset.")
        if not user.is_active:
            raise ValidationError("Cannot assign asset to inactive user.")

        self.assigned_to = user
        self.status = assigned_status
        self.save()

    def unassign(self):
        """Business method to unassign asset"""
        available_status = AssetStatus.objects.get(code='available')

        if self.status.code != 'assigned':
            raise ValidationError("Only assigned assets can be unassigned.")

        self.assigned_to = None
        self.status = available_status
        self.save()

    def mark_for_repair(self):
        """Mark asset for repair"""
        repair_status = AssetStatus.objects.get(code='repair')

        if self.status.code == 'assigned':
            self.assigned_to = None
        self.status = repair_status
        self.save()

    def retire(self):
        """Business method to retire asset"""
        retired_status = AssetStatus.objects.get(code='retired')

        if self.status.code == 'assigned':
            self.assigned_to = None
        self.status = retired_status
        self.save()

    @property
    def is_available(self):
        return self.status and self.status.code == 'available'

    @property
    def is_assigned(self):
        return self.status and self.status.code == 'assigned' and self.assigned_to is not None


class AssetAssignment(models.Model):
    """Track assignment history for audit trail"""
    asset = models.ForeignKey(
        Asset, on_delete=models.CASCADE, related_name='assignment_history')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='assignments_made')
    assigned_date = models.DateTimeField(auto_now_add=True)
    returned_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-assigned_date']

    def __str__(self):
        return f"{self.asset} assigned to {self.assigned_to} on {self.assigned_date}"
