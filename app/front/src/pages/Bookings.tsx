import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";
import { Button, Card, Tile, TileHeader, TileBody, TileField, TileFooter, Alert } from "../components";
import { Booking, Item, Shoot } from "../types";

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [itemId, setItemId] = useState("");
  const [shootId, setShootId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    [id: number]: { item_id: number; shoot_id: number; quantity: number; description: string };
  }>({});

  const load = async () => {
    const [bk, it, sh] = await Promise.all([
      api.get<Booking[]>("/bookings/"),
      api.get<Item[]>("/items/"),
      api.get<Shoot[]>("/shoots/"),
    ]);
    setBookings(bk.data);
    setItems(it.data);
    setShoots(sh.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/bookings/", {
        item_id: parseInt(itemId),
        shoot_id: parseInt(shootId),
        quantity: parseInt(quantity),
        description: description.trim() ? description.trim() : null,
      });
      setItemId("");
      setShootId("");
      setQuantity("1");
      setDescription("");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const del = async (id: number) => {
    try {
      await api.post(`/bookings/${id}/cancel`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (bk: Booking) => {
    setEditing({
      ...editing,
      [bk.id]: {
        item_id: bk.item_id,
        shoot_id: bk.shoot_id,
        quantity: bk.quantity,
        description: bk.description ?? "",
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
      // Single atomic PATCH validated by backend
      await api.patch(`/bookings/${id}`, {
        item_id: e.item_id,
        shoot_id: e.shoot_id,
        quantity: e.quantity,
        description: e.description.trim() ? e.description.trim() : null,
      });
      cancelEdit(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Group bookings by shoot
  const bookingsByShoot: Record<number, Booking[]> = bookings.reduce(
    (acc, bk) => {
      if (!acc[bk.shoot_id]) acc[bk.shoot_id] = [];
      acc[bk.shoot_id].push(bk);
      return acc;
    },
    {} as Record<number, Booking[]>,
  );

  const getShootName = (shootId: number) =>
    shoots.find((s) => s.id === shootId)?.name || `Shoot #${shootId}`;

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

  return (
    <div className="space-y-6">
      {/* (Removed page title header) */}

      {/* Add new booking */}
      <Card title="Add new booking">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3"
        >
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
            required
          >
            <option value="">Select item</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} ({it.type})
              </option>
            ))}
          </select>
          <select
            value={shootId}
            onChange={(e) => setShootId(e.target.value)}
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
            required
          >
            <option value="">Select shoot</option>
            {shoots.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
          />
          <Button type="submit">Add booking</Button>
        </form>
      </Card>

      {/* Error message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Bookings grouped by shoot */}
      <div className="space-y-6">
        {Object.entries(bookingsByShoot).map(([shootIdStr, group]) => {
          const shootId = parseInt(shootIdStr);
          const shoot = shoots.find((s) => s.id === shootId);
          return (
            <Card
              key={shootId}
              title={`Bookings for ${getShootName(shootId)}`}
              actions={
                <Button
                  variant="ghost"
                  onClick={() => {
                    const rows = group.map((bk) => {
                      const it = items.find((i) => i.id === bk.item_id);
                      const sh = shoots.find((s) => s.id === bk.shoot_id);
                      return {
                        booking_id: bk.id,
                        shoot: sh ? sh.name : `Shoot #${bk.shoot_id}`,
                        item: it ? it.name : `Item #${bk.item_id}`,
                        type: it ? it.type : "",
                        quantity: bk.quantity,
                        description: bk.description || "",
                      } as Record<string, string | number>;
                    });
                    const shootName = getShootName(shootId)
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    downloadCSV(rows, `bookings-${shootName}`);
                  }}
                >
                  Download CSV
                </Button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {group.map((bk) => {
                  const item = items.find((it) => it.id === bk.item_id);
                  const isEditing = !!editing[bk.id];
                  const currentItem = isEditing
                    ? items.find((it) => it.id === editing[bk.id].item_id) || item
                    : item;
                  return (
                    <Tile key={bk.id}>
                      <TileHeader
                        title={currentItem ? currentItem.name : `Item #${bk.item_id}`}
                        subtitle={`Booking #${bk.id}`}
                        badge={{ label: `${(isEditing ? editing[bk.id].quantity : bk.quantity)}x`, variant: "info" }}
                      />
                      <TileBody>
                        <dl className="space-y-2">
                          <TileField
                            label="Item"
                            value={
                              isEditing ? (
                                <select
                                  value={editing[bk.id].item_id}
                                  onChange={(e) =>
                                    setEditing({
                                      ...editing,
                                      [bk.id]: {
                                        ...editing[bk.id],
                                        item_id: parseInt(e.target.value),
                                      },
                                    })
                                  }
                                  className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-900 text-sm"
                                >
                                  {items.map((it) => (
                                    <option key={it.id} value={it.id}>
                                      {it.name} ({it.type})
                                    </option>
                                  ))}
                                </select>
                              ) : (currentItem ? currentItem.name : `Item #${bk.item_id}`)
                            }
                            icon={
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                              </svg>
                            }
                          />
                          <TileField
                            label="Item type"
                            value={currentItem ? currentItem.type : "Unknown"}
                            icon={
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                              </svg>
                            }
                          />
                          <TileField
                            label="Shoot"
                            value={
                              isEditing ? (
                                <select
                                  value={editing[bk.id].shoot_id}
                                  onChange={(e) =>
                                    setEditing({
                                      ...editing,
                                      [bk.id]: {
                                        ...editing[bk.id],
                                        shoot_id: parseInt(e.target.value),
                                      },
                                    })
                                  }
                                  className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-900 text-sm"
                                >
                                  {shoots.map((sh) => (
                                    <option key={sh.id} value={sh.id}>
                                      {sh.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (shoot ? shoot.name : `Shoot #${bk.shoot_id}`)
                            }
                            icon={
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A1 1 0 0121 13.382V18a2 2 0 01-2 2H5a2 2 0 01-2-2v-4.618a1 1 0 01.553-.894L8 10m7-6H9a2 2 0 00-2 2v4h12V6a2 2 0 00-2-2z" />
                              </svg>
                            }
                          />
                          <TileField
                            label="Quantity"
                            value={
                              isEditing ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={editing[bk.id].quantity}
                                  onChange={(e) =>
                                    setEditing({
                                      ...editing,
                                      [bk.id]: {
                                        ...editing[bk.id],
                                        quantity: parseInt(e.target.value || "1"),
                                      },
                                    })
                                  }
                                  className="w-24 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                                />
                              ) : (
                                `${bk.quantity}x`
                              )
                            }
                            icon={
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 11h14l-1 10H6L5 11z" />
                              </svg>
                            }
                          />
                          <TileField
                            label="Description"
                            value={
                              isEditing ? (
                                <input
                                  type="text"
                                  value={editing[bk.id].description}
                                  onChange={(e) =>
                                    setEditing({
                                      ...editing,
                                      [bk.id]: {
                                        ...editing[bk.id],
                                        description: e.target.value,
                                      },
                                    })
                                  }
                                  className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                                />
                              ) : (
                                bk.description && bk.description.trim() ? bk.description : "—"
                              )
                            }
                            icon={
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h8M4 10h16M4 14h10M4 18h8" />
                              </svg>
                            }
                          />
                        </dl>
                      </TileBody>
                      <TileFooter>
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button onClick={() => saveEdit(bk.id)} variant="primary">
                                Save
                              </Button>
                              <Button onClick={() => cancelEdit(bk.id)} variant="ghost">
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => startEdit(bk)} variant="secondary">
                                Edit
                              </Button>
                              <Button onClick={() => del(bk.id)} variant="danger">
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </TileFooter>
                    </Tile>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
