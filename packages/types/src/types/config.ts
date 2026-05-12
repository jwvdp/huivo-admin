import { z } from "@hono/zod-openapi";

export const resourceFieldSchema = z.object({
  field: z.string(),
  label: z.string()
});

export const dataScopeOptionSchema = z.object({
  label: z.string(),
  value: z.string()
});

export const permissionsConfigSchema = z.object({
  actions: z.array(z.string()),
  dataScopeOptions: z.array(dataScopeOptionSchema),
  resourceFields: z.record(z.string(), z.array(resourceFieldSchema)),
  resources: z.array(z.string())
});
