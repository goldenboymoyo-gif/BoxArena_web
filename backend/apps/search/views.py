"""
Minimal DB-backed search across public content. This is a plain
`icontains` query — fine for launch scale, but should be swapped for a
dedicated search engine (Postgres full-text search or an external index)
once catalog size makes that necessary. Not a security-sensitive
component: it only ever queries already-public content.
"""
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.events.models import Event
from apps.events.serializers import EventSerializer
from apps.fighters.models import Fighter
from apps.fighters.serializers import FighterSerializer
from apps.news.models import ArticleStatus, NewsArticle


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query or len(query) < 2:
            return Response({"fighters": [], "events": [], "news": []})

        fighters = Fighter.objects.filter(full_name__icontains=query)[:10]
        events = Event.objects.filter(title__icontains=query)[:10]
        news = NewsArticle.objects.filter(title__icontains=query, status=ArticleStatus.PUBLISHED)[:10]

        return Response(
            {
                "fighters": FighterSerializer(fighters, many=True).data,
                "events": EventSerializer(events, many=True).data,
                "news": [{"id": str(a.id), "title": a.title, "slug": a.slug} for a in news],
            }
        )
