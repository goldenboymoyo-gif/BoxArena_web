from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import Fighter
from .serializers import FighterSerializer
from .services import annotate_boosted


class FighterListView(ListAPIView):
    """Boosted (active-PREMIUM boxer subscription) fighters rank first
    within their weight class — this *is* the "advertising" a boxer's
    subscription buys (spec ask)."""

    permission_classes = [AllowAny]
    serializer_class = FighterSerializer
    queryset = annotate_boosted(Fighter.objects.select_related("user__boxer_profile")).order_by(
        "weight_class", "-is_boosted", "ranking"
    )


class FighterDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = FighterSerializer
    queryset = annotate_boosted(Fighter.objects.select_related("user__boxer_profile"))
    lookup_field = "id"
