"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Timer } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Неверный email или пароль");
      return;
    }

    toast.success("Добро пожаловать!");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-transparent" />

      <Card className="relative w-full max-w-md rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-white/5">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Timer className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Вход</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Войдите в свой аккаунт, чтобы продолжить
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-xl min-h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-xl min-h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl min-h-11"
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </Card>
    </div>
  );
}
