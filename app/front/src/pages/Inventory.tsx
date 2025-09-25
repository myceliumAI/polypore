import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type Item = {
  id: number;
  name: string;
  type: "camera" | "light" | "cable" | "other";
  total_stock: number;
};

export function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<Item["type"]>("camera");
  const [total, setTotal] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get<Item[]>("/items").then((r) => setItems(r.data));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/items", { name, type, total_stock: total });
      setName("");
      setType("camera");
      setTotal(1);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Inventory</h1>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="border rounded px-3 py-2"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Item["type"])}
          className="border rounded px-3 py-2"
        >
          <option value="camera">Camera</option>
          <option value="light">Light</option>
          <option value="cable">Cable</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          min={0}
          value={total}
          onChange={(e) => setTotal(parseInt(e.target.value || "0"))}
          className="border rounded px-3 py-2"
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
              <th className="py-2">Type</th>
              <th className="py-2">Total stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="py-2">{it.id}</td>
                <td className="py-2">{it.name}</td>
                <td className="py-2 capitalize">{it.type}</td>
                <td className="py-2">{it.total_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
