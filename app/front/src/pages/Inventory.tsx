import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type Item = {
  id: number;
  name: string;
  type: "camera" | "light" | "cable" | "other";
  total_stock: number;
};

type Editing = {
  [id: number]: { name: string; type: Item["type"]; total_stock: number };
};

export function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<Item["type"]>("camera");
  const [total, setTotal] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>({});

  const load = () => api.get<Item[]>("/items").then((r) => setItems(r.data));

  useEffect(() => {
    void load();
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

  const startEdit = (it: Item) => {
    setEditing({
      ...editing,
      [it.id]: { name: it.name, type: it.type, total_stock: it.total_stock },
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
    await api.patch(`/items/${id}`, e);
    cancelEdit(id);
    await load();
  };

  const del = async (id: number) => {
    await api.delete(`/items/${id}`);
    await load();
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
          onChange={(e) => setTotal(parseInt(e.target.value || "0", 10))}
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
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const e = editing[it.id];
              return (
                <tr key={it.id} className="border-b">
                  <td className="py-2">{it.id}</td>
                  <td className="py-2">
                    {e ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={e.name}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [it.id]: { ...e, name: ev.target.value },
                          })
                        }
                      />
                    ) : (
                      it.name
                    )}
                  </td>
                  <td className="py-2 capitalize">
                    {e ? (
                      <select
                        className="border rounded px-2 py-1"
                        value={e.type}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [it.id]: {
                              ...e,
                              type: ev.target.value as Item["type"],
                            },
                          })
                        }
                      >
                        <option value="camera">Camera</option>
                        <option value="light">Light</option>
                        <option value="cable">Cable</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      it.type
                    )}
                  </td>
                  <td className="py-2">
                    {e ? (
                      <input
                        type="number"
                        min={0}
                        className="border rounded px-2 py-1 w-24"
                        value={e.total_stock}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [it.id]: {
                              ...e,
                              total_stock: parseInt(ev.target.value || "0", 10),
                            },
                          })
                        }
                      />
                    ) : (
                      it.total_stock
                    )}
                  </td>
                  <td className="py-2 space-x-2">
                    {e ? (
                      <>
                        <button
                          onClick={() => saveEdit(it.id)}
                          className="text-blue-600 underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelEdit(it.id)}
                          className="text-neutral-600 underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(it)}
                          className="text-blue-600 underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => del(it.id)}
                          className="text-red-600 underline"
                        >
                          Delete
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
