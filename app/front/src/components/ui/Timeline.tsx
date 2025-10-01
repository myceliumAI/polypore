import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";

type TimelineItem = {
  /**
   * Unique identifier
   */
  id: string | number;
  /**
   * Start date
   */
  startDate: Date;
  /**
   * End date
   */
  endDate: Date;
  /**
   * Tile content to render
   */
  content: ReactNode;
};

type TimelineProps = {
  /**
   * Items to display in the timeline
   */
  items: TimelineItem[];
  /**
   * Optional className
   */
  className?: string;
};

/**
 * Timeline component that organizes tiles chronologically, like a calendar view.
 *
 * :param TimelineItem[] items: Items to display with dates and content
 * :param str className: Additional CSS classes
 */
export function Timeline({ items, className = "" }: TimelineProps) {
  // Sort items by start date
  const sortedItems = [...items].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  // Group items by month
  const groupedByMonth = sortedItems.reduce(
    (acc, item) => {
      const monthKey = `${item.startDate.getFullYear()}-${String(item.startDate.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(item);
      return acc;
    },
    {} as Record<string, TimelineItem[]>,
  );

  // Format month label
  const formatMonthLabel = (monthKey: string): string => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  // Check if date is in the past
  const isPast = (date: Date): boolean => {
    return date < new Date();
  };

  // Calculate duration in days
  const getDuration = (start: Date, end: Date): string => {
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return "Same day";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  return (
    <div className={cn("space-y-8", className)}>
      {Object.entries(groupedByMonth).map(([monthKey, monthItems]) => (
        <div key={monthKey}>
          {/* Month header */}
          <div className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
              {formatMonthLabel(monthKey)}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {monthItems.length} shoot{monthItems.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Timeline items */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-800" />

            <div className="space-y-6">
              {monthItems.map((item) => {
                const past = isPast(item.endDate);
                const duration = getDuration(item.startDate, item.endDate);

                return (
                  <div key={item.id} className="relative">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute -left-[26px] top-6 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-950",
                        past
                          ? "bg-neutral-400 dark:bg-neutral-600"
                          : "bg-gradient-to-br from-purple-500 to-blue-500",
                      )}
                    />

                    {/* Date badge */}
                    <div className="mb-2 flex items-center gap-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <svg
                          className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {item.startDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="text-neutral-400 dark:text-neutral-600">
                          →
                        </span>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {item.endDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {duration}
                      </span>
                    </div>

                    {/* Tile content */}
                    <div
                      className={cn("transition-opacity", past && "opacity-60")}
                    >
                      {item.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {sortedItems.length === 0 && (
        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
          No shoots scheduled
        </div>
      )}
    </div>
  );
}
