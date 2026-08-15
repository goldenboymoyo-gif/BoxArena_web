from django.urls import path

from . import views

urlpatterns = [
    path("", views.FighterListView.as_view(), name="fighter-list"),
    path("<uuid:id>/", views.FighterDetailView.as_view(), name="fighter-detail"),
]
