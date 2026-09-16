import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Synthetic UX Lab" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
