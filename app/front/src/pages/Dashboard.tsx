import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../api";

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

// Unified row for rendering
type Row = {
  key: string | number;
  label: string;
  sublabel?: string;
  series: DayAvailability[];
};

type Mode = "items" | "types";

const DAYS = 90;

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

  const allDates = useMemo(() => {
    if (rows.length === 0) return [] as string[];
    return rows[0].series.map((d) => d.date);
  }, [rows]);

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setMode("items")}
            className={`px-3 py-1.5 rounded-md border ${mode === "items" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"}`}
          >
            Items
          </button>
          <button
            onClick={() => setMode("types")}
            className={`px-3 py-1.5 rounded-md border ${mode === "types" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"}`}
          >
            Types
          </button>
          <div className="text-neutral-500 ml-3">Horizon: {DAYS} days</div>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto border rounded-lg shadow-sm custom-scrollbar p-4 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm">
          <table className="min-w-full text-sm align-top">
            <thead>
              <tr className="text-left">
                <th className="py-3 pr-8 min-w-[220px] sticky left-0 bg-white dark:bg-neutral-900 z-10 text-neutral-700 dark:text-neutral-200">
                  {mode === "items" ? "Item" : "Type"}
                </th>
                {allDates.map((d) => (
                  <th
                    key={d}
                    className="py-3 px-2 text-[11px] font-medium whitespace-nowrap text-neutral-500"
                  >
                    {d.slice(5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="py-3 pr-8 sticky left-0 bg-white dark:bg-neutral-900 z-10">
                    <div className="font-medium capitalize text-neutral-900 dark:text-neutral-100">
                      {row.label}
                    </div>
                    {row.sublabel && (
                      <div className="text-xs text-neutral-500 capitalize">
                        {row.sublabel}
                      </div>
                    )}
                  </td>
                  {row.series.map((day) => (
                    <td key={`${row.key}-${day.date}`} className="py-2 px-2">
                      <div
                        onMouseEnter={(e) => {
                          const rect = (
                            e.target as HTMLElement
                          ).getBoundingClientRect();
                          setTooltip({
                            x: rect.left + rect.width + 10,
                            y: rect.top + window.scrollY + rect.height + 10,
                            lines: formatTooltip(day, row.label),
                          });
                        }}
                        onMouseMove={(e) => {
                          setTooltip((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  x: e.clientX + 12,
                                  y: window.scrollY + e.clientY + 12,
                                }
                              : prev,
                          );
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        className={`h-6 w-6 rounded-md ${cellColor(
                          day.available,
                          day.total,
                        )} cursor-help ring-1 ring-white/50 dark:ring-neutral-900/60 hover:scale-105 transition-transform`}
                        aria-label={`${day.date}: ${day.available}/${day.total}`}
                        role="img"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-neutral-700 dark:text-neutral-300">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-red-500" /> 0
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-orange-400" />{" "}
          low
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-yellow-300" />{" "}
          medium
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3.5 w-3.5 rounded-sm bg-green-500" />{" "}
          high
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 max-w-xs rounded-md border bg-white dark:bg-neutral-900 px-3 py-2 text-xs shadow-xl text-neutral-900 dark:text-neutral-100"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <div className="font-medium mb-1">{tooltip.lines[0]}</div>
          <div className="mb-1 text-neutral-600 dark:text-neutral-300">
            {tooltip.lines[1]}
          </div>
          <ul className="list-disc pl-4">
            {tooltip.lines.slice(2).map((l, i) => (
              <li key={i}>{l.replace(/^•\s*/, "")}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
