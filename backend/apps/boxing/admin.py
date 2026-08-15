from django.contrib import admin

from .models import Gym, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "country", "verification_status"]
    list_filter = ["verification_status"]


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ["name", "city", "country", "verification_status"]
    list_filter = ["verification_status"]
