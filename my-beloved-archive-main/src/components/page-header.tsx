import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  kaomoji,
  backTo = "/",
  backLabel = "← voltar",
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  kaomoji?: string;
  backTo?: string;
  backLabel?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-4">
      <div className="flex items-center justify-between">
        <Link to={backTo} className="label-chip press bg-card inline-flex items-center gap-1">
          {backLabel}
        </Link>
        {kaomoji && (
          <span className="font-mono text-[0.7rem] text-muted-foreground tracking-widest">
            {kaomoji}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground font-mono">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
