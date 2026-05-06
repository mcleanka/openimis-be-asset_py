from django.apps import AppConfig

MODULE_NAME = "asset"

DEFAULT_CFG = {
    # Query rights
    "gql_query_assets_perms": ["160001"],
    "gql_query_asset_assignments_perms": ["160001"],
    "gql_query_device_types_perms": ["160001"],
    "gql_query_asset_statuses_perms": ["160001"],

    # Mutation rights
    "gql_mutation_create_assets_perms": ["160002"],
    "gql_mutation_update_assets_perms": ["160003"],
    "gql_mutation_delete_assets_perms": ["160004"],
    "gql_mutation_assign_assets_perms": ["160005"],
    "gql_mutation_unassign_assets_perms": ["160006"],
    "gql_mutation_repair_assets_perms": ["160007"],
    "gql_mutation_retire_assets_perms": ["160008"],

    # Behaviour flags
    "enforce_same_region_assignment": True,
    "default_device_type_code": "phone",
    "default_asset_status_code": "available",
}


class AssetConfig(AppConfig):
    name = MODULE_NAME
    default_auto_field = "django.db.models.BigAutoField"

    # Materialised config (populated in ready())
    gql_query_assets_perms = []
    gql_query_asset_assignments_perms = []
    gql_query_device_types_perms = []
    gql_query_asset_statuses_perms = []
    gql_mutation_create_assets_perms = []
    gql_mutation_update_assets_perms = []
    gql_mutation_delete_assets_perms = []
    gql_mutation_assign_assets_perms = []
    gql_mutation_unassign_assets_perms = []
    gql_mutation_repair_assets_perms = []
    gql_mutation_retire_assets_perms = []
    enforce_same_region_assignment = True
    default_device_type_code = "phone"
    default_asset_status_code = "available"

    def _load_config(self, cfg):
        for field in cfg:
            if hasattr(AssetConfig, field):
                setattr(AssetConfig, field, cfg[field])

    def ready(self):
        from core.models import ModuleConfiguration

        cfg = ModuleConfiguration.get_or_default(MODULE_NAME, DEFAULT_CFG)
        self._load_config(cfg)

        # Wire mutation signals
        from .signals import bind_signals
        bind_signals()
