import { LoginForm } from "@/components/auth/login-form";
import { safeCallbackUrl } from "@/lib/url";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(
    typeof params.callbackUrl === "string" ? params.callbackUrl : undefined
  );

  return <LoginForm callbackUrl={callbackUrl} />;
}
