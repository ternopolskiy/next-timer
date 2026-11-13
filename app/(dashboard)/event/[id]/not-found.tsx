import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EventNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
        <CalendarX2 className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        Событие не найдено
      </h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Возможно, оно было удалено или принадлежит другому аккаунту.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-6 rounded-full min-h-11 px-6"
        )}
      >
        Вернуться к событиям
      </Link>
    </div>
  );
}
