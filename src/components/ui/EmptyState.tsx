interface EmptyStateProps {
  icon?:     React.ReactNode;
  title:     string;
  message?:  string;
  action?:   React.ReactNode;
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon && (
        <span className="text-5xl mb-2 text-slate-300 dark:text-slate-600" aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className="text-heading-3 text-slate-700 dark:text-slate-300">{title}</h3>
      {message && <p className="text-body-sm text-slate-500 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
