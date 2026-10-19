interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageWrapper({
  children,
  title,
  description,
  actions,
  className = "",
}: PageWrapperProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      {(title || actions) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
