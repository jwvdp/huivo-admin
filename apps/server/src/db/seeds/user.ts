import type { Auth } from "better-auth";

export async function seedUser(auth: Auth) {
  await auth.api.signUpEmail({
    body: {
      email: "1@1.cc",
      name: "Test",
      password: "12345687"
    }
  });
}
