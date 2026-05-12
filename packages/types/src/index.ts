export {
  dataScopeOptionSchema,
  permissionsConfigSchema,
  resourceFieldSchema
} from "./types/config";

export {
  createDepartmentSchema,
  departmentSchema,
  type Department,
  type DepartmentTreeNode,
  updateDepartmentSchema
} from "./types/department";

export {
  createRoleSchema,
  roleSchema,
  type Role,
  updateRoleSchema
} from "./types/role";

export {
  type UserWithRole,
  updateUserRolesSchema,
  userWithRoleSchema
} from "./types/user";
