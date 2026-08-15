from django.contrib import admin

from .models import NewsArticle


@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "status", "published_at"]
    list_filter = ["status"]
    prepopulated_fields = {"slug": ("title",)}
