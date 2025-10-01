import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";
import {
  Button,
  Input,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../components";
import { Item } from "../types";

type Editing = {
  [id: number]: { name: string; type: Item["type"]; total_stock: number };
};

export function Stock() {
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
    try {
      await api.patch(`/items/${id}`, e);
      cancelEdit(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const del = async (id: number) => {
    try {
      await api.delete(`/items/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stock</h1>
        <div className="text-sm text-neutral-500">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Add new item */}
      <Card title="Add new item">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Item["type"])}
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
          >
            <option value="camera">Camera</option>
            <option value="light">Light</option>
            <option value="cable">Cable</option>
            <option value="other">Other</option>
          </select>
          <Input
            type="number"
            min="1"
            value={total}
            onChange={(e) => setTotal(parseInt(e.target.value))}
            placeholder="Quantity"
            required
          />
          <Button type="submit">Add item</Button>
        </form>
      </Card>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
          ❌ {error}
        </div>
      )}

      {/* Items table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>ID</TableCell>
              <TableCell header>Name</TableCell>
              <TableCell header>Type</TableCell>
              <TableCell header>Total Stock</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => {
              const isEditing = !!editing[it.id];
              return (
                <TableRow key={it.id}>
                  <TableCell>{it.id}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editing[it.id].name}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [it.id]: {
                              ...editing[it.id],
                              name: e.target.value,
                            },
                          })
                        }
                        className="max-w-xs"
                      />
                    ) : (
                      it.name
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <select
                        value={editing[it.id].type}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [it.id]: {
                              ...editing[it.id],
                              type: e.target.value as Item["type"],
                            },
                          })
                        }
                        className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                      >
                        <option value="camera">Camera</option>
                        <option value="light">Light</option>
                        <option value="cable">Cable</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      it.type
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        value={editing[it.id].total_stock}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [it.id]: {
                              ...editing[it.id],
                              total_stock: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-24"
                      />
                    ) : (
                      it.total_stock
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => saveEdit(it.id)}
                            variant="primary"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => cancelEdit(it.id)}
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => startEdit(it)}
                            variant="secondary"
                          >
                            Edit
                          </Button>
                          <Button onClick={() => del(it.id)} variant="danger">
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
