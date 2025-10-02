import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";

type TileProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

/**
 * Tile container component for card-like layouts.
 *
 * :param ReactNode children: Tile content
 * :param str className: Additional CSS classes
 * :param function onClick: Optional click handler
 */
export function Tile({ children, className = "", onClick }: TileProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow",
        onClick &&
        "cursor-pointer hover:border-purple-300 dark:hover:border-purple-700",
        className,
      )}
    >
      {children}
    </div>
  );
}

type TileHeaderProps = {
  title: ReactNode;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: "success" | "warning" | "error" | "info";
  };
  actions?: ReactNode;
};

/**
 * Tile header component with title, optional subtitle, badge, and actions.
 */
export function TileHeader({
  title,
  subtitle,
  badge,
  actions,
}: TileHeaderProps) {
  const badgeColors = {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };

  return (
    <div className="flex items-start justify-between gap-4 p-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {title}
          </h3>
          {badge && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                badgeColors[badge.variant || "info"],
              )}
            >
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

type TileBodyProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Tile body component for main content.
 */
export function TileBody({ children, className = "" }: TileBodyProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

type TileFieldProps = {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
};

/**
 * Tile field component for displaying label/value pairs.
 */
export function TileField({ label, value, icon }: TileFieldProps) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {icon && (
        <span className="text-neutral-400 dark:text-neutral-500 mt-0.5">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </dt>
        <dd className="text-sm text-neutral-900 dark:text-neutral-100 mt-0.5 break-words">
          {value}
        </dd>
      </div>
    </div>
  );
}

type TileFooterProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Tile footer component for actions or additional info.
 */
export function TileFooter({ children, className = "" }: TileFooterProps) {
  return (
    <div
      className={cn(
        "p-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
