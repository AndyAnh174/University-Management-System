from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", _("Admin")
        TEACHER = "TEACHER", _("Teacher")
        STUDENT = "STUDENT", _("Student")

    role = models.CharField(
        max_length=50, 
        choices=Role.choices, 
        default=Role.STUDENT,
        verbose_name=_("Role")
    )
    
    avatar = models.ImageField(
        upload_to="avatars/", 
        null=True, 
        blank=True,
        verbose_name=_("Avatar")
    )
    
    phone_number = models.CharField(
        max_length=15, 
        blank=True, 
        null=True,
        verbose_name=_("Phone Number")
    )

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return f"{self.username} ({self.role})"
