import type { LibSQLDatabase } from "drizzle-orm/libsql";

import {
  resourceField,
  role,
  roleFieldPermission,
  rolePermission
} from "../schemas/role";

// ── 数据定义 ──

const rolesData = [
  {
    dataScope: "all" as const,
    description: "系统管理员，拥有全部权限",
    id: "seed-role-admin",
    isBuiltIn: true,
    name: "管理员",
    permissions: [
      { action: "create", resource: "user" },
      { action: "read", resource: "user" },
      { action: "update", resource: "user" },
      { action: "delete", resource: "user" },
      { action: "create", resource: "order" },
      { action: "read", resource: "order" },
      { action: "update", resource: "order" },
      { action: "delete", resource: "order" },
      { action: "create", resource: "product" },
      { action: "read", resource: "product" },
      { action: "update", resource: "product" },
      { action: "delete", resource: "product" }
    ]
  },
  {
    dataScope: "self" as const,
    description: "普通员工，仅可查看和编辑本人数据",
    id: "seed-role-user",
    isBuiltIn: true,
    name: "普通用户",
    permissions: [
      { action: "read", resource: "user" },
      { action: "create", resource: "order" },
      { action: "read", resource: "order" },
      { action: "read", resource: "product" }
    ]
  },
  {
    dataScope: "department" as const,
    description: "研发部门成员，可管理技术相关资源",
    id: "seed-role-developer",
    isBuiltIn: false,
    name: "开发者",
    permissions: [
      { action: "read", resource: "user" },
      { action: "read", resource: "order" },
      { action: "read", resource: "product" },
      { action: "update", resource: "product" }
    ]
  },
  {
    dataScope: "department_and_sub" as const,
    description: "销售部门成员，可查看本部门及下属数据",
    id: "seed-role-sales",
    isBuiltIn: false,
    name: "销售员",
    permissions: [
      { action: "read", resource: "user" },
      { action: "create", resource: "order" },
      { action: "read", resource: "order" },
      { action: "update", resource: "order" },
      { action: "read", resource: "product" }
    ]
  }
];

const resourceFieldsData = [
  // user 资源
  { field: "email", label: "邮箱", resource: "user" },
  { field: "name", label: "姓名", resource: "user" },
  { field: "phone", label: "手机号", resource: "user" },
  { field: "salary", label: "薪资", resource: "user" },
  { field: "idCard", label: "身份证号", resource: "user" },

  // order 资源
  { field: "orderNo", label: "订单号", resource: "order" },
  { field: "amount", label: "金额", resource: "order" },
  { field: "customerName", label: "客户名称", resource: "order" },
  { field: "customerPhone", label: "客户电话", resource: "order" },
  { field: "discount", label: "折扣", resource: "order" },

  // product 资源
  { field: "name", label: "产品名称", resource: "product" },
  { field: "price", label: "售价", resource: "product" },
  { field: "costPrice", label: "成本价", resource: "product" },
  { field: "stock", label: "库存", resource: "product" },
  { field: "supplier", label: "供应商", resource: "product" }
];

// 角色-字段可见性配置
const fieldPermissionsData = [
  // 普通用户：看不到薪资、身份证、成本价、折扣
  {
    field: "salary",
    resource: "user",
    roleId: "seed-role-user",
    visible: false
  },
  {
    field: "idCard",
    resource: "user",
    roleId: "seed-role-user",
    visible: false
  },
  {
    field: "costPrice",
    resource: "product",
    roleId: "seed-role-user",
    visible: false
  },
  {
    field: "discount",
    resource: "order",
    roleId: "seed-role-user",
    visible: false
  },

  // 开发者：看不到薪资、身份证、成本价、供应商
  {
    field: "salary",
    resource: "user",
    roleId: "seed-role-developer",
    visible: false
  },
  {
    field: "idCard",
    resource: "user",
    roleId: "seed-role-developer",
    visible: false
  },
  {
    field: "costPrice",
    resource: "product",
    roleId: "seed-role-developer",
    visible: false
  },
  {
    field: "supplier",
    resource: "product",
    roleId: "seed-role-developer",
    visible: false
  },

  // 销售员：看不到成本价、身份证
  {
    field: "salary",
    resource: "user",
    roleId: "seed-role-sales",
    visible: false
  },
  {
    field: "idCard",
    resource: "user",
    roleId: "seed-role-sales",
    visible: false
  },
  {
    field: "costPrice",
    resource: "product",
    roleId: "seed-role-sales",
    visible: false
  }
];

// ── 注入 ──

export async function seedRole(db: LibSQLDatabase) {
  // 清空旧数据（按 FK 依赖反向顺序删除）
  await db.delete(roleFieldPermission);
  await db.delete(resourceField);
  await db.delete(rolePermission);
  await db.delete(role);

  // 角色
  for (const r of rolesData) {
    const { permissions, ...roleData } = r;
    await db.insert(role).values(roleData);

    if (permissions.length > 0) {
      await db.insert(rolePermission).values(
        permissions.map((p) => ({
          id: crypto.randomUUID(),
          roleId: roleData.id,
          ...p
        }))
      );
    }
  }

  // 资源字段
  if (resourceFieldsData.length > 0) {
    await db
      .insert(resourceField)
      .values(
        resourceFieldsData.map((f) => ({ id: crypto.randomUUID(), ...f }))
      );
  }

  // 角色-字段可见性
  if (fieldPermissionsData.length > 0) {
    await db
      .insert(roleFieldPermission)
      .values(
        fieldPermissionsData.map((fp) => ({ id: crypto.randomUUID(), ...fp }))
      );
  }
}
