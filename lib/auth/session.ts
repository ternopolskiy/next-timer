import { getServerSession } from "next-auth";
import { UnauthorizedError } from "@/lib/errors";
import { authOptions } from "./options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  return session;
}
