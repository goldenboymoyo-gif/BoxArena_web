from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import Fighter
from .serializers import FighterSerializer


class FighterListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FighterSerializer
    queryset = Fighter.objects.all().order_by("weight_class", "ranking")


class FighterDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = FighterSerializer
    queryset = Fighter.objects.all()
    lookup_field = "id"
