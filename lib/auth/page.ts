import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireSessionPage(callbackUrl?: string) {
  const session = await getSession();

  if (!session?.user?.id) {
    const target = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";

    redirect(target);
  }

  return session;
}
