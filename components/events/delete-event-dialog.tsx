"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteEventAction } from "@/lib/actions/event";
import type { EventDTO } from "@/lib/dto/event";

interface DeleteEventDialogProps {
  event: EventDTO | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

/**
 * Подтверждение удаления. Диалог остаётся открытым до ответа сервера,
 * чтобы пользователь видел, что действие выполняется.
 */
export function DeleteEventDialog({
  event,
  onOpenChange,
  onDeleted,
}: DeleteEventDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const open = event !== null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return;
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    if (!event) return;

    setIsDeleting(true);
    const result = await deleteEventAction(event.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Событие удалено");
    onOpenChange(false);
    onDeleted(result.data.id);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Удалить событие?</AlertDialogTitle>
        <AlertDialogDescription>
          «{event?.title}» будет удалено без возможности восстановления.
        </AlertDialogDescription>

        <AlertDialogFooter>
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-4"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            className="min-h-11 rounded-xl px-4"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление…" : "Удалить"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
