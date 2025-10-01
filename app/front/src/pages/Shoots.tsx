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
  ShareMenu,
  Timeline,
  MapView,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shoots</h1>
        <div className="text-sm text-neutral-500">
          {shoots.length} shoot{shoots.length !== 1 ? "s" : ""}
        </div>
      </div>

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
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
          ❌ {error}
        </div>
      )}

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
          items={shoots.map((s) => {
            const isEditing = !!editing[s.id];
            return {
              id: s.id,
              startDate: new Date(s.start_date),
              endDate: new Date(s.end_date),
              content: (
                <Tile key={s.id}>
                  <TileHeader
                    title={
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
                          className="text-base font-semibold"
                        />
                      ) : (
                        s.name
                      )
                    }
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
                        <ShareMenu
                          data={[
                            {
                              id: s.id,
                              name: s.name,
                              location: s.location,
                              start: formatDate(s.start_date),
                              end: formatDate(s.end_date),
                            },
                          ]}
                          filename={`shoot-${s.name.toLowerCase().replace(/\s+/g, "-")}`}
                          shareText={`Check out this shoot: ${s.name} at ${s.location}`}
                        />
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
