import { DashboardClient } from "@/components/events/dashboard-client";
import { requireSessionPage } from "@/lib/auth/page";
import { toEventDTOs } from "@/lib/dto/event";
import { EventService } from "@/lib/services/event";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSessionPage();
  const events = await EventService.getAll(session.user.id);

  return (
    <DashboardClient
      initialEvents={toEventDTOs(events)}
      timezone={session.user.timezone ?? null}
    />
  );
}
