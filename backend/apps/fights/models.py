import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class FightResultMethod(models.TextChoices):
    KO = "KO", "Knockout"
    TKO = "TKO", "Technical knockout"
    DECISION = "DECISION", "Decision"
    DRAW = "DRAW", "Draw"
    NO_CONTEST = "NO_CONTEST", "No contest"
    DISQUALIFICATION = "DQ", "Disqualification"


class Fight(TimeStampedModel):
    """A single bout on an Event's card. Results are staff-controlled —
    never writable by either fighter's own account (spec principle applied
    from boxer-verification: real-world sporting facts require an
    authorized backend process, not self-reporting)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="fights")
    fighter_1 = models.ForeignKey("fighters.Fighter", on_delete=models.PROTECT, related_name="fights_as_fighter_1")
    fighter_2 = models.ForeignKey("fighters.Fighter", on_delete=models.PROTECT, related_name="fights_as_fighter_2")

    weight_class = models.CharField(max_length=50, blank=True)
    is_title_fight = models.BooleanField(default=False)
    card_position = models.PositiveSmallIntegerField(default=0, help_text="0 = main event")
    rounds_scheduled = models.PositiveSmallIntegerField(default=12)

    winner = models.ForeignKey(
        "fighters.Fighter", null=True, blank=True, on_delete=models.SET_NULL, related_name="fights_won"
    )
    result_method = models.CharField(max_length=20, choices=FightResultMethod.choices, blank=True)
    result_round = models.PositiveSmallIntegerField(null=True, blank=True)

    result_recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="fight_results_recorded"
    )
    result_recorded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["card_position"]

    def __str__(self):
        return f"{self.fighter_1} vs {self.fighter_2}"
