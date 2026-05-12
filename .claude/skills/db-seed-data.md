---
name: db-seed-data
description: Use when creating or modifying seed data files in apps/server/src/db/seeds/
---

# DB Seed Data

## Overview

Seed data for local development and testing. Each module has a corresponding file in `apps/server/src/db/seeds/`, orchestrated by `seed/index.ts`.

## File Structure

```
apps/server/src/db/seeds/
  role.ts
  department.ts
  user.ts
  index.ts        — orchestrates seeding order
```

## Data/Injection Separation

Each seed file has two clear sections:

```ts
// ── Data Definition ──
const rolesData = [{ id: "seed-role-admin", name: "管理员", dataScope: "all" }];

// ── Injection ──
export async function seedRole(db: LibSQLDatabase) {
  await db.delete(role);
  for (const r of rolesData) {
    await db.insert(role).values(r);
  }
}
```

## Fixed IDs

Use readable fixed IDs (e.g., `seed-role-admin`, `seed-dept-rd`). This enables cross-seed references (e.g., department's `defaultRoleId`) and manual query verification.

## Test Data Coverage

- Cover every enum value (e.g., all 4 dataScope variants)
- Tree structures: at least 3 levels deep (e.g., 总部 → 研发部 → 前端组)
- Vary permissions and field masks across records to test different display scenarios

## Injection Order

In `seed/index.ts`, seed in dependency order — referenced tables first:

```ts
await seedRole(seedDb); // department references role.id
await seedDepartment(seedDb); // userDepartment references department.id
await seedUser(seedAuth); // create users last
```

## Verification

```bash
cd apps/server && bun db:reset
```

## Related Skills

- **db-schema-definition** — the table schemas that seed data populates
