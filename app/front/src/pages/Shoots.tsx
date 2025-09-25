import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type Shoot = {
  id: number;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
};

export function Shoots() {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<Shoot[]>("/shoots").then((r) => setShoots(r.data));

  useEffect(() => {
    load();
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
            </tr>
          </thead>
          <tbody>
            {shoots.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.id}</td>
                <td className="py-2">{s.name}</td>
                <td className="py-2">{s.location}</td>
                <td className="py-2">
                  {new Date(s.start_date).toLocaleString()}
                </td>
                <td className="py-2">
                  {new Date(s.end_date).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
