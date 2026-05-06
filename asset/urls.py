"""REST URL patterns for the asset module.

GraphQL is wired through the central schema (see ``schema.py``). The asset
module currently exposes no REST endpoints; the empty list satisfies the
assembly URL loader.
"""
from django.urls import path

urlpatterns: list[path] = []
