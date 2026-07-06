import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  alert?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, alert, actions }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="cf-page-title">{title}</h1>
          {description ? <p className="cf-page-lead">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {alert ? <div className="mt-4">{alert}</div> : null}
    </header>
  );
}