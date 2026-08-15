import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class ArticleStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PUBLISHED = "PUBLISHED", "Published"
    ARCHIVED = "ARCHIVED", "Archived"


class NewsArticle(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="news_articles")
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.CharField(max_length=500, blank=True)
    body = models.TextField()
    cover_image_key = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=15, choices=ArticleStatus.choices, default=ArticleStatus.DRAFT)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["status", "published_at"])]

    def __str__(self):
        return self.title
