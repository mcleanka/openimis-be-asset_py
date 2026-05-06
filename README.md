# openimis-be-asset

openIMIS Backend reference module for tracking mobile assets (phones, tablets) and
their assignment to users across regional teams.

## Concepts

- `DeviceType` — phone, tablet, … (reference data, history tracked).
- `AssetStatus` — available / assigned / repair / retired (reference data).
- `Asset` — a tracked device, scoped to a `location.Location` (region).
- `AssetAssignment` — audit-trail record of a `core.User` holding an `Asset`.

## Reuse of openIMIS core entities

| Concept | This module | Reused from |
|---|---|---|
| Region | `location.Location` (`type='R'`) | `openimis-be-location` |
| User holding an asset | `core.User` (`InteractiveUser`) | `openimis-be-core` |
| Roles & rights | `core.Role`, `core.RoleRight` | `openimis-be-core` |
| History / soft-delete | `core.HistoryModel` | `openimis-be-core` |
| Mutation audit log | `core.MutationLog` + `AssetMutation` | `openimis-be-core` |

## Configuration

Defaults in `asset.apps.DEFAULT_CFG`. Overridable per deployment via
`core.ModuleConfiguration` (the `openimis.json` mechanism). Permission rights
codes live in the `1600xx` block (free at the time of writing — verify against
your assembly).

```json
{
  "name": "asset",
  "config": {
    "gql_query_assets_perms": ["160001"],
    "gql_mutation_create_assets_perms": ["160002"],
    "gql_mutation_update_assets_perms": ["160003"],
    "gql_mutation_delete_assets_perms": ["160004"],
    "gql_mutation_assign_assets_perms": ["160005"],
    "gql_mutation_unassign_assets_perms": ["160006"],
    "gql_mutation_repair_assets_perms": ["160007"],
    "gql_mutation_retire_assets_perms": ["160008"]
  }
}
```

## Installing into an openIMIS assembly

1. `pip install -e ./openimis-be-asset_py` from the assembly project root.
2. Add to `openimis.json`:
   ```json
   { "name": "asset" }
   ```
3. `python manage.py migrate asset`.

## Permissions

| Right | Action |
|---|---|
| 160001 | Query assets / device types / statuses |
| 160002 | Create asset |
| 160003 | Update asset |
| 160004 | Delete (soft-delete) asset |
| 160005 | Assign asset to user |
| 160006 | Unassign asset |
| 160007 | Mark for repair |
| 160008 | Retire asset |

## Module structure

```
asset/
├── apps.py                # AssetConfig + DEFAULT_CFG
├── models.py              # HistoryModel-based Asset / AssetAssignment / DeviceType / AssetStatus
├── services.py            # Pure business logic (no HTTP / GraphQL)
├── schema.py              # Query + Mutation aggregator
├── gql_queries.py         # Object types & filterable connection fields
├── gql_mutations.py       # OpenIMISMutation subclasses
├── signals.py             # signal_mutation_module_validate / _after_mutating
├── admin.py               # Optional Django admin registration
├── migrations/
└── tests/
    ├── test_services.py
    └── test_gql.py
```
