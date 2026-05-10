import type { Auth } from "better-auth";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { userRole } from "../schemas/role";
import { userDepartment } from "../schemas/user-department";

interface SeedUser {
  email: string;
  name: string;
  password: string;
  roles: string[];
  departments: { id: string; isHead: boolean }[];
}

const usersData: SeedUser[] = [
  // ── 管理岗 ──
  {
    departments: [{ id: "seed-dept-hq", isHead: true }],
    email: "admin@huivo.com",
    name: "超级管理员",
    password: "12345687",
    roles: ["seed-role-admin"]
  },
  {
    departments: [{ id: "seed-dept-exec-office", isHead: true }],
    email: "zhang@huivo.com",
    name: "张经理",
    password: "12345687",
    roles: ["seed-role-admin"]
  },

  // ── 汇合数据 ──
  {
    departments: [{ id: "seed-dept-huivo-business", isHead: false }],
    email: "li@huivo.com",
    name: "李业务",
    password: "12345687",
    roles: ["seed-role-sales"]
  },
  {
    departments: [{ id: "seed-dept-huivo-quality", isHead: false }],
    email: "wang@huivo.com",
    name: "王品质",
    password: "12345687",
    roles: ["seed-role-user"]
  },
  {
    departments: [{ id: "seed-dept-huivo-finance", isHead: false }],
    email: "zhao@huivo.com",
    name: "赵财务",
    password: "12345687",
    roles: ["seed-role-user"]
  },
  {
    departments: [{ id: "seed-dept-huivo-engineering", isHead: false }],
    email: "sun@huivo.com",
    name: "孙工程",
    password: "12345687",
    roles: ["seed-role-user"]
  },
  {
    departments: [{ id: "seed-dept-huivo-production", isHead: false }],
    email: "zhou@huivo.com",
    name: "周生产",
    password: "12345687",
    roles: ["seed-role-user"]
  },
  {
    departments: [{ id: "seed-dept-huivo-procurement", isHead: false }],
    email: "wu@huivo.com",
    name: "吴采购",
    password: "12345687",
    roles: ["seed-role-user"]
  },

  // ── 将为科技 ──
  {
    departments: [{ id: "seed-dept-jw-tech", isHead: false }],
    email: "chen@jiangwei.com",
    name: "陈开发",
    password: "12345687",
    roles: ["seed-role-developer"]
  },
  {
    departments: [{ id: "seed-dept-jw-ft-1", isHead: false }],
    email: "liu@jiangwei.com",
    name: "刘外贸",
    password: "12345687",
    roles: ["seed-role-sales"]
  },
  {
    departments: [{ id: "seed-dept-jw-ft-2", isHead: false }],
    email: "huang@jiangwei.com",
    name: "黄外贸",
    password: "12345687",
    roles: ["seed-role-sales"]
  },
  {
    departments: [{ id: "seed-dept-jw-domestic-sales", isHead: false }],
    email: "xu@jiangwei.com",
    name: "徐销售",
    password: "12345687",
    roles: ["seed-role-sales"]
  },
  {
    departments: [{ id: "seed-dept-jw-marketing", isHead: false }],
    email: "yang@jiangwei.com",
    name: "杨市场",
    password: "12345687",
    roles: ["seed-role-user"]
  },
  {
    departments: [{ id: "seed-dept-jw-product", isHead: false }],
    email: "ni@jiangwei.com",
    name: "倪产品",
    password: "12345687",
    roles: ["seed-role-user"]
  },
  {
    departments: [{ id: "seed-dept-jw-finance", isHead: false }],
    email: "qian@jiangwei.com",
    name: "钱财务",
    password: "12345687",
    roles: ["seed-role-user"]
  },
  {
    departments: [{ id: "seed-dept-jw-admin", isHead: false }],
    email: "shen@jiangwei.com",
    name: "沈行政",
    password: "12345687",
    roles: ["seed-role-user"]
  }
];

export async function seedUser(auth: Auth, db: LibSQLDatabase) {
  // 避免重复插入
  await db.delete(userRole);
  await db.delete(userDepartment);

  for (const u of usersData) {
    const { departments, roles, ...signupData } = u;
    // oxlint-disable-next-line no-null/no-null
    const result = await auth.api
      .signUpEmail({ body: signupData })
      .catch(() => null);
    if (!result) {
      continue;
    }

    const userId = result.user.id;

    if (roles.length > 0) {
      await db
        .insert(userRole)
        .values(roles.map((roleId) => ({ roleId, userId })));
    }

    if (departments.length > 0) {
      await db.insert(userDepartment).values(
        departments.map((d) => ({
          departmentId: d.id,
          isHead: d.isHead,
          userId
        }))
      );
    }
  }
}
