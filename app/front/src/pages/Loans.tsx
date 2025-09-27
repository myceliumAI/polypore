import React, { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type Item = { id: number; name: string };
type Shoot = { id: number; name: string; start_date: string };
type Loan = { id: number; item_id: number; shoot_id: number; quantity: number };

type IdOption = number | "";

type Editing = { [id: number]: { quantity: number } };

export function Loans() {
  const [items, setItems] = useState<Item[]>([]);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  const [itemId, setItemId] = useState<IdOption>("");
  const [shootId, setShootId] = useState<IdOption>("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>({});

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

  const submit = async (e: React.FormEvent) => {
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

  const canEditOrCancel = (loan: Loan) => {
    const s = shoots.find((s) => s.id === loan.shoot_id);
    if (!s) return false;
    return Date.now() < new Date(s.start_date).getTime();
  };

  const startEdit = (ln: Loan) => {
    if (!canEditOrCancel(ln)) return;
    setEditing({ ...editing, [ln.id]: { quantity: ln.quantity } });
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
      await api.patch(`/loans/${id}`, { quantity: e.quantity });
      cancelEdit(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const cancelLoan = async (id: number) => {
    try {
      await api.post(`/loans/${id}/cancel`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
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
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((ln) => {
              const e = editing[ln.id];
              return (
                <tr key={ln.id} className="border-b">
                  <td className="py-2">{ln.id}</td>
                  <td className="py-2">
                    {items.find((i) => i.id === ln.item_id)?.name || ln.item_id}
                  </td>
                  <td className="py-2">
                    {shoots.find((s) => s.id === ln.shoot_id)?.name ||
                      ln.shoot_id}
                  </td>
                  <td className="py-2">
                    {e ? (
                      <input
                        type="number"
                        min={1}
                        className="border rounded px-2 py-1 w-24"
                        value={e.quantity}
                        onChange={(ev) =>
                          setEditing({
                            ...editing,
                            [ln.id]: {
                              quantity: parseInt(ev.target.value || "1", 10),
                            },
                          })
                        }
                      />
                    ) : (
                      ln.quantity
                    )}
                  </td>
                  <td className="py-2 space-x-2">
                    {e ? (
                      <>
                        <button
                          onClick={() => void saveEdit(ln.id)}
                          className="text-blue-600 underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelEdit(ln.id)}
                          className="text-neutral-600 underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {canEditOrCancel(ln) && (
                          <>
                            <button
                              onClick={() => startEdit(ln)}
                              className="text-blue-600 underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void cancelLoan(ln.id)}
                              className="text-red-600 underline"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {!canEditOrCancel(ln) && (
                          <span className="text-neutral-400">—</span>
                        )}
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
