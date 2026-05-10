import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { department } from "../schemas/department";
import { userDepartment } from "../schemas/user-department";

// ── 数据定义 ──

interface DeptData {
  id: string;
  name: string;
  slug: string;
  fullPath: string;
  order: number;
  parentId: string | null;
  defaultRoleId: string | null;
}

const departmentsData: DeptData[] = [
  // 总公司（根）
  {
    defaultRoleId: null,
    fullPath: "/总公司",
    id: "seed-dept-hq",
    name: "总公司",
    order: 0,
    parentId: null,
    slug: "headquarters"
  },

  // 总公司 → 直属部门
  {
    defaultRoleId: null,
    fullPath: "/总公司/总经办",
    id: "seed-dept-exec-office",
    name: "总经办",
    order: 0,
    parentId: "seed-dept-hq",
    slug: "executive-office"
  },

  // 总公司 → 汇合数据
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据",
    id: "seed-dept-huivo",
    name: "汇合数据",
    order: 1,
    parentId: "seed-dept-hq",
    slug: "huivo-data"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据/行政部",
    id: "seed-dept-huivo-admin",
    name: "行政部",
    order: 0,
    parentId: "seed-dept-huivo",
    slug: "huivo-admin"
  },
  {
    defaultRoleId: "seed-role-sales",
    fullPath: "/总公司/汇合数据/业务部",
    id: "seed-dept-huivo-business",
    name: "业务部",
    order: 1,
    parentId: "seed-dept-huivo",
    slug: "huivo-business"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据/品质部",
    id: "seed-dept-huivo-quality",
    name: "品质部",
    order: 2,
    parentId: "seed-dept-huivo",
    slug: "huivo-quality"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据/工程部",
    id: "seed-dept-huivo-engineering",
    name: "工程部",
    order: 3,
    parentId: "seed-dept-huivo",
    slug: "huivo-engineering"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据/生产部",
    id: "seed-dept-huivo-production",
    name: "生产部",
    order: 4,
    parentId: "seed-dept-huivo",
    slug: "huivo-production"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据/采购部",
    id: "seed-dept-huivo-procurement",
    name: "采购部",
    order: 5,
    parentId: "seed-dept-huivo",
    slug: "huivo-procurement"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据/财务部",
    id: "seed-dept-huivo-finance",
    name: "财务部",
    order: 6,
    parentId: "seed-dept-huivo",
    slug: "huivo-finance"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/汇合数据/仓储部",
    id: "seed-dept-huivo-warehouse",
    name: "仓储部",
    order: 7,
    parentId: "seed-dept-huivo",
    slug: "huivo-warehouse"
  },

  // 总公司 → 将为科技
  {
    defaultRoleId: null,
    fullPath: "/总公司/将为科技",
    id: "seed-dept-jiangwei",
    name: "将为科技",
    order: 2,
    parentId: "seed-dept-hq",
    slug: "jiangwei-tech"
  },
  {
    defaultRoleId: "seed-role-sales",
    fullPath: "/总公司/将为科技/外贸一部",
    id: "seed-dept-jw-ft-1",
    name: "外贸一部",
    order: 0,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-foreign-trade-1"
  },
  {
    defaultRoleId: "seed-role-sales",
    fullPath: "/总公司/将为科技/外贸二部",
    id: "seed-dept-jw-ft-2",
    name: "外贸二部",
    order: 1,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-foreign-trade-2"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/将为科技/市场部",
    id: "seed-dept-jw-marketing",
    name: "市场部",
    order: 2,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-marketing"
  },
  {
    defaultRoleId: "seed-role-developer",
    fullPath: "/总公司/将为科技/技术部",
    id: "seed-dept-jw-tech",
    name: "技术部",
    order: 3,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-technology"
  },
  {
    defaultRoleId: "seed-role-sales",
    fullPath: "/总公司/将为科技/国内销售部",
    id: "seed-dept-jw-domestic-sales",
    name: "国内销售部",
    order: 4,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-domestic-sales"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/将为科技/财务部",
    id: "seed-dept-jw-finance",
    name: "财务部",
    order: 5,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-finance"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/将为科技/行政部",
    id: "seed-dept-jw-admin",
    name: "行政部",
    order: 6,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-admin"
  },
  {
    defaultRoleId: null,
    fullPath: "/总公司/将为科技/产品部",
    id: "seed-dept-jw-product",
    name: "产品部",
    order: 7,
    parentId: "seed-dept-jiangwei",
    slug: "jiangwei-product"
  }
];

// ── 注入 ──

export async function seedDepartment(db: LibSQLDatabase) {
  await db.delete(userDepartment);
  await db.delete(department);

  await db.insert(department).values(departmentsData);
}
