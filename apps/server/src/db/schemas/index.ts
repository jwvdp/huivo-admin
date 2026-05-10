import { account, session, user, verification } from "./auth";
import { department } from "./department";
import {
  resourceField,
  role,
  roleFieldPermission,
  rolePermission,
  userRole
} from "./role";
import { userDepartment } from "./user-department";

export const schemas = {
  account,
  department,
  resourceField,
  role,
  roleFieldPermission,
  rolePermission,
  session,
  user,
  userDepartment,
  userRole,
  verification
};
