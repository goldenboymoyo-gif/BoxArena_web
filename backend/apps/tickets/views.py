import io

from django.http import HttpResponse
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsModeratorOrAbove

from . import services
from .models import Ticket
from .serializers import ScanTicketSerializer, TicketSerializer


class MyTicketsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        # Scoped to request.user — never another user's tickets (spec §8).
        return Ticket.objects.filter(owner=self.request.user).select_related("ticket_type").order_by("-created_at")


class TicketQrCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            ticket = Ticket.objects.get(id=id, owner=request.user)
        except Ticket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=404)

        import qrcode

        img = qrcode.make(ticket.signed_token)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return HttpResponse(buffer.getvalue(), content_type="image/png")


class ScanTicketView(APIView):
    """Restricted to moderators/staff at the venue gate — not a public
    endpoint, since scanning transitions VALID -> USED (spec §13)."""

    permission_classes = [IsAuthenticated, IsModeratorOrAbove]

    def post(self, request):
        serializer = ScanTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket, result = services.scan_ticket(serializer.validated_data["token"], scanned_by=request.user)

        if result == "invalid_token":
            return Response({"detail": "Invalid ticket."}, status=400)
        if result == "already_used":
            return Response({"detail": "Ticket already scanned.", "scanned_at": ticket.scanned_at}, status=409)
        if result == "not_valid":
            return Response({"detail": f"Ticket is {ticket.status}."}, status=409)
        return Response({"detail": "Ticket accepted.", "ticket": TicketSerializer(ticket).data})
