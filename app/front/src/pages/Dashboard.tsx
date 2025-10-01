import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";
import { Button, Card } from "../components";

// Types matching backend endpoints
type DayBreakdown = { shoot_id: number; shoot_name: string; quantity: number };

type DayAvailability = {
  date: string; // YYYY-MM-DD
  available: number;
  total: number;
  breakdown: DayBreakdown[];
};

type ItemTimeline = {
  item_id: number;
  name: string;
  type: "camera" | "light" | "cable" | "other";
  series: DayAvailability[];
};

type TypeTimeline = {
  type: "camera" | "light" | "cable" | "other";
  series: DayAvailability[];
};

type Row = {
  key: string | number;
  label: string;
  sublabel?: string;
  series: DayAvailability[];
};

type Mode = "items" | "types";

const DAYS = 90;
const CELL_PX = 36;
const STICKY_COL_PX = 240;

function cellColor(available: number, total: number): string {
  if (total <= 0) return "bg-neutral-300 dark:bg-neutral-700";
  const ratio = available / total;
  if (available === 0) return "bg-red-500";
  if (ratio <= 0.33) return "bg-orange-400";
  if (ratio <= 0.66) return "bg-yellow-300";
  return "bg-green-500";
}

function formatTooltip(day: DayAvailability, label: string): string[] {
  const header = `${day.date} — ${label}`;
  const avail = `${day.available}/${day.total} available`;
  const lines = day.breakdown.length
    ? day.breakdown.map((b) => `• ${b.shoot_name} (${b.quantity})`)
    : ["No reservations"];
  return [header, avail, ...lines];
}

export function Dashboard() {
  const [mode, setMode] = useState<Mode>("items");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    lines: string[];
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    const endpoint =
      mode === "items" ? "/dashboard/timeline" : "/dashboard/timeline-by-type";
    api
      .get(endpoint + `?days=${DAYS}`)
      .then((r) => {
        if (mode === "items") {
          const data = r.data as ItemTimeline[];
          setRows(
            data.map((it) => ({
              key: it.item_id,
              label: it.name,
              sublabel: it.type,
              series: it.series,
            })),
          );
        } else {
          const data = r.data as TypeTimeline[];
          setRows(
            data.map((t) => ({
              key: t.type,
              label: t.type,
              sublabel: undefined,
              series: t.series,
            })),
          );
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [mode]);

  const dates = rows.length > 0 ? rows[0].series.map((d) => d.date) : [];

  const showTooltip = (
    e: React.MouseEvent,
    day: DayAvailability,
    label: string,
  ) => {
    setTooltip({
      x: e.clientX + 10,
      y: e.clientY - 10,
      lines: formatTooltip(day, label),
    });
  };

  const hideTooltip = () => setTooltip(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setMode("items")}
            variant={mode === "items" ? "primary" : "ghost"}
          >
            Items
          </Button>
          <Button
            onClick={() => setMode("types")}
            variant={mode === "types" ? "primary" : "ghost"}
          >
            Types
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
          ❌ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </Card>
      )}

      {/* Timeline */}
      {!loading && rows.length > 0 && (
        <Card>
          <div className="overflow-auto custom-scrollbar">
            <div className="min-w-max">
              {/* Header row */}
              <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 sticky top-0 z-10">
                <div
                  className="flex-shrink-0 px-4 py-3 font-medium text-xs uppercase text-neutral-700 dark:text-neutral-300 sticky left-0 bg-neutral-50 dark:bg-neutral-900/50 z-20"
                  style={{ width: STICKY_COL_PX }}
                >
                  {mode === "items" ? "Item / Type" : "Type"}
                </div>
                {dates.map((date) => (
                  <div
                    key={date}
                    className="flex-shrink-0 px-2 py-3 text-center text-xs text-neutral-600 dark:text-neutral-400"
                    style={{ width: CELL_PX }}
                  >
                    {date.slice(5)}
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                >
                  <div
                    className="flex-shrink-0 px-4 py-3 flex flex-col justify-center sticky left-0 bg-white dark:bg-neutral-900 z-10 border-r border-neutral-200 dark:border-neutral-800"
                    style={{ width: STICKY_COL_PX }}
                  >
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {row.label}
                    </span>
                    {row.sublabel && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {row.sublabel}
                      </span>
                    )}
                  </div>
                  {row.series.map((day, i) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 cursor-pointer ring-1 ring-neutral-200 dark:ring-neutral-700 hover:ring-2 hover:ring-purple-500 transition-all ${cellColor(
                        day.available,
                        day.total,
                      )}`}
                      style={{ width: CELL_PX, height: 48 }}
                      onMouseEnter={(e) => showTooltip(e, day, row.label)}
                      onMouseLeave={hideTooltip}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-6 text-xs">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Legend:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-500 ring-1 ring-neutral-300 dark:ring-neutral-600" />
              <span className="text-neutral-600 dark:text-neutral-400">
                67%+ available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-yellow-300 ring-1 ring-neutral-300 dark:ring-neutral-600" />
              <span className="text-neutral-600 dark:text-neutral-400">
                34–66% available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-400 ring-1 ring-neutral-300 dark:ring-neutral-600" />
              <span className="text-neutral-600 dark:text-neutral-400">
                1–33% available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-red-500 ring-1 ring-neutral-300 dark:ring-neutral-600" />
              <span className="text-neutral-600 dark:text-neutral-400">
                Fully booked
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl text-xs max-w-xs pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.lines.map((line, i) => (
            <div
              key={i}
              className={`${
                i === 0
                  ? "font-semibold text-neutral-900 dark:text-neutral-100 mb-1"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
