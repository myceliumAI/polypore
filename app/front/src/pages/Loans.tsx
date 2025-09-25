import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type Item = { id: number; name: string };
type Shoot = { id: number; name: string };
type Loan = {
  id: number;
  item_id: number;
  shoot_id: number;
  quantity: number;
  returned_at?: string | null;
};

type IdOption = number | "";

export function Loans() {
  const [items, setItems] = useState<Item[]>([]);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  const [itemId, setItemId] = useState<IdOption>("");
  const [shootId, setShootId] = useState<IdOption>("");
  const [qty, setQty] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [it, sh, ln] = await Promise.all([
      api.get<Item[]>("/items"),
      api.get<Shoot[]>("/shoots"),
      api.get<Loan[]>("/loans"),
    ]);
    setItems(it.data);
    setShoots(sh.data);
    setLoans(ln.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (typeof itemId !== "number" || typeof shootId !== "number") return;
      await api.post("/loans", {
        item_id: itemId,
        shoot_id: shootId,
        quantity: qty,
      });
      setItemId("");
      setShootId("");
      setQty(1);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const doReturn = async (id: number) => {
    await api.post(`/returns/${id}`);
    await load();
  };

  const onChangeItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setItemId(v ? parseInt(v, 10) : "");
  };
  const onChangeShoot = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setShootId(v ? parseInt(v, 10) : "");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Loans</h1>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select
          value={itemId}
          onChange={onChangeItem}
          className="border rounded px-3 py-2"
          required
        >
          <option value="">Select item…</option>
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name}
            </option>
          ))}
        </select>
        <select
          value={shootId}
          onChange={onChangeShoot}
          className="border rounded px-3 py-2"
          required
        >
          <option value="">Select shoot…</option>
          {shoots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || "1", 10))}
          className="border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">
          Create loan
        </button>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Item</th>
              <th className="py-2">Shoot</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Returned</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((ln) => (
              <tr key={ln.id} className="border-b">
                <td className="py-2">{ln.id}</td>
                <td className="py-2">
                  {items.find((i) => i.id === ln.item_id)?.name || ln.item_id}
                </td>
                <td className="py-2">
                  {shoots.find((s) => s.id === ln.shoot_id)?.name ||
                    ln.shoot_id}
                </td>
                <td className="py-2">{ln.quantity}</td>
                <td className="py-2">{ln.returned_at ? "Yes" : "No"}</td>
                <td className="py-2">
                  {!ln.returned_at && (
                    <button
                      onClick={() => {
                        void doReturn(ln.id);
                      }}
                      className="text-blue-600 underline"
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
