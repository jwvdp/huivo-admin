import type { AppRouteHandler } from "../../common";
import type { GetPermissionsConfigRoute } from "./route";

import { resourceField as resourceFieldTable } from "../../../db/schemas/role";
import { db } from "../../../lib/drizzle";

const BUILTIN_ACTIONS = ["create", "read", "update", "delete"];

const DATA_SCOPE_OPTIONS = [
  { label: "全部数据", value: "all" },
  { label: "本部门", value: "department" },
  { label: "部门及下属", value: "department_and_sub" },
  { label: "仅本人", value: "self" }
];

export const getPermissionsConfigHandler: AppRouteHandler<
  GetPermissionsConfigRoute
> = async (c) => {
  const fields = await db(c.env).select().from(resourceFieldTable);

  const resources = [...new Set(fields.map((f) => f.resource))].toSorted();

  const resourceFields: Record<string, { field: string; label: string }[]> = {};
  for (const f of fields) {
    if (!resourceFields[f.resource]) {
      resourceFields[f.resource] = [];
    }
    resourceFields[f.resource].push({ field: f.field, label: f.label });
  }

  return c.json(
    {
      actions: BUILTIN_ACTIONS,
      dataScopeOptions: DATA_SCOPE_OPTIONS,
      resourceFields,
      resources
    },
    200
  );
};
