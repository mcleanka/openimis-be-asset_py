"""
Wire the ``MutationLog`` ↔ ``AssetMutation`` join, mirroring
``claim.schema.bind_signals``. The openIMIS core dispatches
``signal_mutation_module_validate`` *before* the mutation is applied and
``signal_mutation_module_after_mutating`` *after*.
"""
import logging

from core.models import MutationLog
from core.schema import (
    signal_mutation_module_after_mutating,
    signal_mutation_module_validate,
)

from .models import Asset, AssetMutation

logger = logging.getLogger(__name__)


def _on_asset_mutation(sender, **kwargs):
    """Link impacted assets to the MutationLog row."""
    data = kwargs.get("data", {}) or {}
    uuid = data.get("uuid")
    if not uuid:
        return []
    asset = Asset.objects.filter(id=uuid).first()
    if asset:
        AssetMutation.objects.create(
            asset=asset, mutation_id=kwargs["mutation_log_id"]
        )
    return []


def _on_asset_after_mutation(sender, **kwargs):
    if kwargs.get("error_messages"):
        return []
    return []


def bind_signals():
    signal_mutation_module_validate["asset"].connect(_on_asset_mutation)
    signal_mutation_module_after_mutating["asset"].connect(
        _on_asset_after_mutation
    )
