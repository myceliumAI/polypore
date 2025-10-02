import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
};

/**
 * Reusable Card component for containers.
 *
 * :param ReactNode children: Card content
 * :param str title: Optional title displayed at the top of the card
 * :param str className: Additional CSS classes
 * :return JSX.Element: Styled card
 */
export function Card({ children, className = "", title, actions }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {title}
          </h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={title ? "p-6" : "p-6"}>{children}</div>
    </div>
  );
}
