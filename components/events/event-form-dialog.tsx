"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "@/components/events/event-form";
import type { EventDTO } from "@/lib/dto/event";
import type { ActionResult } from "@/lib/errors";
import type { EventFormValues } from "@/lib/validation/event";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  defaultValues: EventFormValues | null;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  submitEvent: (values: EventFormValues) => Promise<ActionResult<EventDTO>>;
  onSuccess: (event: EventDTO) => void;
}

/**
 * Общая оболочка диалога для создания и редактирования. Форма
 * монтируется заново при каждом открытии, поэтому сбрасывается сама.
 */
export function EventFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  submitLabel,
  pendingLabel,
  successMessage,
  submitEvent,
  onSuccess,
}: EventFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto overscroll-contain rounded-3xl border border-border/50 bg-background/95 p-0 backdrop-blur-xl sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {defaultValues && (
          <EventForm
            defaultValues={defaultValues}
            submitLabel={submitLabel}
            pendingLabel={pendingLabel}
            successMessage={successMessage}
            submitEvent={submitEvent}
            onSuccess={onSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
