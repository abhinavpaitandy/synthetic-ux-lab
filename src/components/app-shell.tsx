import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  ClipboardCheck,
  Flag,
  FlaskConical,
  LayoutGrid,
  PlusCircle,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { to: "/", label: "Experiments", icon: LayoutGrid },
  { to: "/experiments/new", label: "New Experiment", icon: PlusCircle },
] as const;

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutGrid },
  { to: "/admin/general", label: "General", icon: Settings },
  { to: "/admin/ai", label: "AI & Simulation", icon: Brain },
  { to: "/admin/population", label: "Synthetic Population", icon: Users },
  { to: "/admin/evaluation", label: "Evaluation", icon: ClipboardCheck },
  { to: "/admin/features", label: "Feature Flags", icon: Flag },
  { to: "/admin/status", label: "System Status", icon: Activity },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FlaskConical className="size-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-sidebar-foreground">
              Synthetic UX Lab
            </div>
            <div className="text-[11px] text-muted-foreground">
              Synthetic UX Pre-Testing
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3">
          <div className="label-caps mb-1.5 mt-2 px-3">Workspace</div>
          {MAIN_NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:text-sidebar-accent-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}

          <div className="my-3 border-t border-sidebar-border" />

          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isAdmin
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Admin
          </Link>

          {isAdmin && (
            <div className="mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border ml-3 pl-3">
              {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/admin" }}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:text-sidebar-accent-foreground",
                  }}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="mt-auto px-6 py-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Synthetic simulations surface likely usability problems early. They
            do not replace real users or usability research.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-8 py-8">
        <div className="max-w-2xl">
          {eyebrow ? <div className="label-caps mb-2">{eyebrow}</div> : null}
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-8">{children}</main>
  );
}
