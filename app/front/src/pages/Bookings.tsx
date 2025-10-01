import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";
import {
  Button,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../components";
import { Booking, Item, Shoot } from "../types";

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [itemId, setItemId] = useState("");
  const [shootId, setShootId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [bk, it, sh] = await Promise.all([
      api.get<Booking[]>("/bookings"),
      api.get<Item[]>("/items"),
      api.get<Shoot[]>("/shoots"),
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
      await api.post("/bookings", {
        item_id: parseInt(itemId),
        shoot_id: parseInt(shootId),
        quantity: parseInt(quantity),
      });
      setItemId("");
      setShootId("");
      setQuantity("1");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const del = async (id: number) => {
    try {
      await api.delete(`/bookings/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <div className="text-sm text-neutral-500">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Add new booking */}
      <Card title="Add new booking">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
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
          <Button type="submit">Add booking</Button>
        </form>
      </Card>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
          ❌ {error}
        </div>
      )}

      {/* Bookings table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>ID</TableCell>
              <TableCell header>Item</TableCell>
              <TableCell header>Shoot</TableCell>
              <TableCell header>Quantity</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((bk) => {
              const item = items.find((it) => it.id === bk.item_id);
              const shoot = shoots.find((sh) => sh.id === bk.shoot_id);
              return (
                <TableRow key={bk.id}>
                  <TableCell>{bk.id}</TableCell>
                  <TableCell>
                    {item
                      ? `${item.name} (${item.type})`
                      : `Item #${bk.item_id}`}
                  </TableCell>
                  <TableCell>
                    {shoot ? shoot.name : `Shoot #${bk.shoot_id}`}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                      {bk.quantity}x
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => del(bk.id)} variant="danger">
                        Delete
                      </Button>
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
