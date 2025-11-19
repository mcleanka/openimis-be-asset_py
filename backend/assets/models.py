from django.db import models
from django.utils import timezone
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
        on_delete=models.SET_NULL,
        related_name='users',
        null=True,      # Allows NULL in database
        blank=True      # Allows empty value in serializers
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.SET_NULL,
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

    def delete(self, *args, **kwargs):
        """Override delete to handle business rules"""
        # Check if user has assigned assets
        if self.assigned_assets.exists():
            raise ValidationError(
                f"Cannot delete user '{self.name}' because they have assets assigned. "
                "Unassign all assets first."
            )

        super().delete(*args, **kwargs)


class Asset(models.Model):
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)

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
        on_delete=models.PROTECT,
        related_name='assets'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.serial_number})"

    def _get_default_device_type(self):
        """Get default device type"""
        return DeviceType.objects.filter(code='phone').first()

    def _get_default_status(self):
        """Get default asset status"""
        return AssetStatus.objects.filter(is_default=True).first()

    def save(self, *args, **kwargs):
        """Set default values for new fields if not provided"""
        if not self.device_type:
            self.device_type = self._get_default_device_type()

        if not self.status:
            self.status = self._get_default_status()

        super().save(*args, **kwargs)

    def _get_status_by_code(self, code):
        """Helper to get status by code"""
        try:
            return AssetStatus.objects.get(code=code)
        except AssetStatus.DoesNotExist:
            return None

    def _validate_assignment_rules(self):
        """Core validation logic for asset assignment"""
        if not self.status or not self.region:
            return

        if self.assigned_to and self.assigned_to.region != self.region:
            raise ValidationError(
                "Asset can only be assigned to a user in the same region.")

        if self.status.code == 'assigned' and not self.assigned_to:
            raise ValidationError("Assigned assets must have a user assigned.")

        if self.status.code != 'assigned' and self.assigned_to:
            raise ValidationError(
                "Unassigned assets cannot have an assigned user.")

        if self.status.code == 'retired' and self.assigned_to:
            raise ValidationError(
                "Retired assets cannot be assigned to users.")

    def clean(self):
        """Django model validation - called before save in forms"""
        self._validate_assignment_rules()

    def validate_for_assignment(self, user):
        """Validate if asset can be assigned to user"""
        if not self.is_available:
            raise ValidationError("Only available assets can be assigned.")

        if user.region != self.region:
            raise ValidationError("User must be in the same region as asset.")

    def assign_to_user(self, user, notes=""):
        """Business method to assign asset to user with audit trail"""
        assigned_status = self._get_status_by_code('assigned')
        if not assigned_status:
            raise ValidationError("Assigned status not found")

        self.validate_for_assignment(user)

        # Create assignment record - use the assigned user as assigned_by for simplicity
        AssetAssignment.objects.create(
            asset=self,
            assigned_to=user,
            assigned_by=user,
            notes=notes,
            assignment_region=self.region,
            assignment_status=assigned_status
        )

        self.assigned_to = user
        self.status = assigned_status
        self.save()

    def unassign(self, notes=""):
        """Business method to unassign asset with audit trail"""
        available_status = self._get_status_by_code('available')
        if not available_status:
            raise ValidationError("Available status not found")

        if self.status.code != 'assigned':
            raise ValidationError("Only assigned assets can be unassigned.")

        # Mark the active assignment as returned
        active_assignment = self.assignment_history.filter(
            returned_date__isnull=True
        ).first()

        if active_assignment:
            active_assignment.returned_date = timezone.now()
            if notes:
                active_assignment.notes = notes
            active_assignment.save()

        self.assigned_to = None
        self.status = available_status
        self.save()

    def mark_for_repair(self, notes=""):
        """Mark asset for repair with assignment history tracking"""
        repair_status = self._get_status_by_code('repair')
        if not repair_status:
            raise ValidationError("Repair status not found")

        # If asset was assigned, mark the assignment as returned
        if self.status.code == 'assigned':
            active_assignment = self.assignment_history.filter(
                returned_date__isnull=True
            ).first()

            if active_assignment:
                active_assignment.returned_date = timezone.now()
                active_assignment.notes = f"Sent for repair: {notes}"
                active_assignment.save()

        self.assigned_to = None
        self.status = repair_status
        self.save()

    def retire(self, notes=""):
        """Business method to retire asset with assignment history tracking"""
        retired_status = self._get_status_by_code('retired')
        if not retired_status:
            raise ValidationError("Retired status not found")

        # If asset was assigned, mark the assignment as returned
        if self.status.code == 'assigned':
            active_assignment = self.assignment_history.filter(
                returned_date__isnull=True
            ).first()

            if active_assignment:
                active_assignment.returned_date = timezone.now()
                active_assignment.notes = f"Asset retired: {notes}"
                active_assignment.save()

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
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assignment_records'
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='assignments_made'
    )
    assigned_date = models.DateTimeField(auto_now_add=True)
    returned_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    assignment_status = models.ForeignKey(
        AssetStatus,
        on_delete=models.PROTECT,
        related_name='assignment_records',
        null=True,
        blank=True
    )
    assignment_region = models.ForeignKey(
        Region,
        on_delete=models.PROTECT,
        related_name='assignment_records',
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-assigned_date']
        db_table = 'asset_assignments'

    def __str__(self):
        status = "Active" if not self.returned_date else "Returned"
        return f"{self.asset} → {self.assigned_to} ({status})"

    def save(self, *args, **kwargs):
        """Auto-populate assignment_region and assignment_status if not set"""
        if not self.assignment_region and self.asset:
            self.assignment_region = self.asset.region
        if not self.assignment_status and self.asset:
            self.assignment_status = self.asset.status
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.returned_date is None

    @property
    def duration_days(self):
        if not self.assigned_date:
            return 0
        end_date = self.returned_date or timezone.now()
        return (end_date - self.assigned_date).days

    def mark_returned(self, notes=""):
        if not self.returned_date:
            self.returned_date = timezone.now()
            if notes:
                self.notes = notes
            self.save()
