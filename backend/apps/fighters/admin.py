from django.contrib import admin

from .models import Fighter


@admin.register(Fighter)
class FighterAdmin(admin.ModelAdmin):
    list_display = ["full_name", "weight_class", "ranking", "wins", "losses", "draws", "is_p4p"]
    list_filter = ["weight_class", "is_p4p"]
    search_fields = ["full_name", "nickname"]
