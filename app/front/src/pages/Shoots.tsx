import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type Shoot = {
  id: number;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
};

type Editing = {
  [id: number]: { name: string; location: string; start: string; end: string };
};

export function Shoots() {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>({});

  const load = () => api.get<Shoot[]>("/shoots").then((r) => setShoots(r.data));

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/shoots", {
        name,
        location,
        start_date: new Date(start).toISOString(),
        end_date: new Date(end).toISOString(),
      });
      setName("");
      setLocation("");
      setStart("");
      setEnd("");
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
    await api.delete(`/shoots/${id}`);
    await load();
  };

  const downloadCsv = async (id: number) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/shoots/${id}/packing-list.csv`,
    );
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shoot_${id}_packing_list.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Shoots</h1>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border rounded px-3 py-2"
          required
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">
          Add
        </button>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Location</th>
              <th className="py-2">Start</th>
              <th className="py-2">End</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shoots.map((s) => {
              const e = editing[s.id];
              return (
                <tr key={s.id} className="border-b">
                  <td className="py-2">{s.id}</td>
                  <td className="py-2">
                    {e ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={e.name}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [s.id]: { ...e, name: ev.target.value },
                          })
                        }
                      />
                    ) : (
                      s.name
                    )}
                  </td>
                  <td className="py-2">
                    {e ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={e.location}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [s.id]: { ...e, location: ev.target.value },
                          })
                        }
                      />
                    ) : (
                      s.location
                    )}
                  </td>
                  <td className="py-2">
                    {e ? (
                      <input
                        type="datetime-local"
                        className="border rounded px-2 py-1"
                        value={e.start}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [s.id]: { ...e, start: ev.target.value },
                          })
                        }
                      />
                    ) : (
                      new Date(s.start_date).toLocaleString()
                    )}
                  </td>
                  <td className="py-2">
                    {e ? (
                      <input
                        type="datetime-local"
                        className="border rounded px-2 py-1"
                        value={e.end}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [s.id]: { ...e, end: ev.target.value },
                          })
                        }
                      />
                    ) : (
                      new Date(s.end_date).toLocaleString()
                    )}
                  </td>
                  <td className="py-2 space-x-2">
                    {e ? (
                      <>
                        <button
                          onClick={() => saveEdit(s.id)}
                          className="text-blue-600 underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelEdit(s.id)}
                          className="text-neutral-600 underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(s)}
                          className="text-blue-600 underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => del(s.id)}
                          className="text-red-600 underline"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            void downloadCsv(s.id);
                          }}
                          className="text-green-700 underline"
                        >
                          Download CSV
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
