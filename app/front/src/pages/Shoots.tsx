import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";
import {
  Button,
  Input,
  Card,
  DateRangePicker,
  AddressInput,
  Tile,
  TileHeader,
  TileBody,
  TileField,
  TileFooter,
  Timeline,
  MapView,
  Alert,
} from "../components";
import { Shoot } from "../types";
import { formatDate } from "../lib/utils";
import { batchGeocode } from "../lib/geocoding";

type Editing = {
  [id: number]: { name: string; location: string; start: string; end: string };
};

type ShootWithCoords = Shoot & {
  lat?: number;
  lng?: number;
};

export function Shoots() {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [shootsWithCoords, setShootsWithCoords] = useState<ShootWithCoords[]>(
    [],
  );
  const [viewMode, setViewMode] = useState<"timeline" | "map">("timeline");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState("18:00");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>({});
  // Filters
  const [filterName, setFilterName] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(
    undefined,
  );
  const [filterStartTime, setFilterStartTime] = useState("00:00");
  const [filterEndTime, setFilterEndTime] = useState("23:59");
  const [showPast, setShowPast] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const load = () => api.get<Shoot[]>("/shoots").then((r) => setShoots(r.data));

  useEffect(() => {
    void load();
  }, []);

  // Geocode shoots when they change
  useEffect(() => {
    if (shoots.length === 0) {
      setShootsWithCoords([]);
      return;
    }

    const geocodeShoots = async () => {
      const addresses = shoots.map((s) => s.location);
      const coords = await batchGeocode(addresses);

      const withCoords = shoots.map((shoot, i) => ({
        ...shoot,
        lat: coords[i]?.lat,
        lng: coords[i]?.lng,
      }));

      setShootsWithCoords(withCoords);
    };

    void geocodeShoots();
  }, [shoots]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    try {
      // Combine date and time
      const startDateTime = new Date(startDate);
      const [startHour, startMin] = startTime.split(":");
      startDateTime.setHours(parseInt(startHour), parseInt(startMin));

      const endDateTime = new Date(endDate);
      const [endHour, endMin] = endTime.split(":");
      endDateTime.setHours(parseInt(endHour), parseInt(endMin));

      await api.post("/shoots", {
        name,
        location,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
      });
      setName("");
      setLocation("");
      setStartDate(undefined);
      setStartTime("09:00");
      setEndDate(undefined);
      setEndTime("18:00");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (s: Shoot) => {
    setEditing({
      ...editing,
      [s.id]: {
        name: s.name,
        location: s.location,
        start: s.start_date.slice(0, 16), // yyyy-MM-ddTHH:mm
        end: s.end_date.slice(0, 16),
      },
    });
  };

  const cancelEdit = (id: number) => {
    const next = { ...editing };
    delete next[id];
    setEditing(next);
  };

  const saveEdit = async (id: number) => {
    const e = editing[id];
    if (!e) return;
    try {
      await api.patch(`/shoots/${id}`, {
        name: e.name,
        location: e.location,
        start_date: new Date(e.start).toISOString(),
        end_date: new Date(e.end).toISOString(),
      });
      cancelEdit(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const del = async (id: number) => {
    try {
      await api.delete(`/shoots/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const downloadCSV = (
    data: Record<string, string | number>[],
    filename: string,
  ) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]?.toString() || "";
            return value.includes(",") || value.includes('"')
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(","),
      ),
    ];

    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filtering ---
  const normalizeWithTime = (date: Date, timeHHmm: string): Date => {
    const [h, m] = timeHHmm.split(":");
    const d = new Date(date);
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  };

  const periodsOverlap = (
    aStart: Date,
    aEnd: Date,
    bStart: Date,
    bEnd: Date,
  ): boolean => aStart <= bEnd && aEnd >= bStart;

  const matchesFilters = (s: Shoot): boolean => {
    const now = new Date();
    const sStart = new Date(s.start_date);
    const sEnd = new Date(s.end_date);

    const nameOk = !filterName.trim()
      ? true
      : s.name.toLowerCase().includes(filterName.trim().toLowerCase());

    const isUpcoming = sStart > now;
    const isPast = !isUpcoming;
    const statusOk = showPast || showUpcoming
      ? (showPast && isPast) || (showUpcoming && isUpcoming)
      : true;

    const hasRange = !!filterStartDate || !!filterEndDate;
    let rangeOk = true;
    if (hasRange && (filterStartDate || filterEndDate)) {
      const rStart = filterStartDate
        ? normalizeWithTime(filterStartDate, filterStartTime)
        : new Date(-8640000000000000);
      const rEnd = filterEndDate
        ? normalizeWithTime(filterEndDate, filterEndTime)
        : new Date(8640000000000000);
      rangeOk = periodsOverlap(sStart, sEnd, rStart, rEnd);
    }

    return nameOk && statusOk && rangeOk;
  };

  const filteredShoots = shoots.filter(matchesFilters);

  return (
    <div className="space-y-6">
      {/* (Removed page title header) */}

      {/* Add new shoot */}
      <Card title="Add new shoot">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shoot name"
              required
            />
            <AddressInput
              value={location}
              onChange={setLocation}
              placeholder="Location"
              required
            />
          </div>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />

          <Button type="submit">Add shoot</Button>
        </form>
      </Card>

      {/* Error message */}
      {error && <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Filters */}
      <Card title="Filters">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Search by name"
            />
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={showPast}
                onChange={(e) => setShowPast(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              Past only
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={showUpcoming}
                onChange={(e) => setShowUpcoming(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              Upcoming only
            </label>
          </div>
          <DateRangePicker
            startDate={filterStartDate}
            endDate={filterEndDate}
            startTime={filterStartTime}
            endTime={filterEndTime}
            onStartDateChange={setFilterStartDate}
            onEndDateChange={setFilterEndDate}
            onStartTimeChange={setFilterStartTime}
            onEndTimeChange={setFilterEndTime}
          />
        </div>
      </Card>

      {/* View mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={() => setViewMode("timeline")}
          variant={viewMode === "timeline" ? "primary" : "ghost"}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Timeline
        </Button>
        <Button
          onClick={() => setViewMode("map")}
          variant={viewMode === "map" ? "primary" : "ghost"}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          Map
        </Button>
      </div>

      {/* Timeline view */}
      {viewMode === "timeline" && (
        <Timeline
          items={filteredShoots.map((s) => {
            const isEditing = !!editing[s.id];
            return {
              id: s.id,
              startDate: new Date(s.start_date),
              endDate: new Date(s.end_date),
              content: (
                <Tile key={s.id}>
                  <TileHeader
                    title={s.name}
                    subtitle={`Shoot #${s.id}`}
                    badge={{
                      label:
                        new Date(s.start_date) > new Date()
                          ? "Upcoming"
                          : "Past",
                      variant:
                        new Date(s.start_date) > new Date()
                          ? "info"
                          : "success",
                    }}
                  />

                  <TileBody>
                    <dl className="space-y-3">
                      <TileField
                        label="Name"
                        value={
                          isEditing ? (
                            <Input
                              value={editing[s.id].name}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  [s.id]: {
                                    ...editing[s.id],
                                    name: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            s.name
                          )
                        }
                      />

                      <TileField
                        label="Location"
                        value={
                          isEditing ? (
                            <Input
                              value={editing[s.id].location}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  [s.id]: {
                                    ...editing[s.id],
                                    location: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            s.location
                          )
                        }
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        }
                      />
                      <TileField
                        label="Start"
                        value={
                          isEditing ? (
                            <input
                              type="datetime-local"
                              value={editing[s.id].start}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  [s.id]: {
                                    ...editing[s.id],
                                    start: e.target.value,
                                  },
                                })
                              }
                              className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                            />
                          ) : (
                            formatDate(s.start_date)
                          )
                        }
                        icon={
                          <svg
                            className="w-4 h-4"
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
                        }
                      />
                      <TileField
                        label="End"
                        value={
                          isEditing ? (
                            <input
                              type="datetime-local"
                              value={editing[s.id].end}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  [s.id]: {
                                    ...editing[s.id],
                                    end: e.target.value,
                                  },
                                })
                              }
                              className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                            />
                          ) : (
                            formatDate(s.end_date)
                          )
                        }
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        }
                      />
                    </dl>
                  </TileBody>

                  <TileFooter>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => saveEdit(s.id)}
                          variant="primary"
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => cancelEdit(s.id)}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => startEdit(s)}
                            variant="secondary"
                          >
                            Edit
                          </Button>
                          <Button onClick={() => del(s.id)} variant="danger">
                            Delete
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            downloadCSV(
                              [
                                {
                                  id: s.id,
                                  name: s.name,
                                  location: s.location,
                                  start: formatDate(s.start_date),
                                  end: formatDate(s.end_date),
                                },
                              ],
                              `shoot-${s.name.toLowerCase().replace(/\s+/g, "-")}`,
                            )
                          }
                        >
                          Download CSV
                        </Button>
                      </div>
                    )}
                  </TileFooter>
                </Tile>
              ),
            };
          })}
        />
      )}

      {/* Map view */}
      {viewMode === "map" && (
        <MapView
          locations={shootsWithCoords
            .filter((s) => s.lat && s.lng)
            .filter((s) => matchesFilters(s))
            .map((s) => ({
              id: s.id,
              name: s.name,
              address: s.location,
              lat: s.lat!,
              lng: s.lng!,
              info: `${new Date(s.start_date).toLocaleDateString("fr-FR")} - ${new Date(s.end_date).toLocaleDateString("fr-FR")}`,
            }))}
          height="600px"
        />
      )}
    </div>
  );
}
