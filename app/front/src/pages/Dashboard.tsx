import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type ItemAvailability = {
  item_id: number;
  name: string;
  type: "camera" | "light" | "cable" | "other";
  total_stock: number;
  available_now: number;
};

export function Dashboard() {
  const [rows, setRows] = useState<ItemAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ItemAvailability[]>("/dashboard/inventory")
      .then((r) => {
        setRows(r.data);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Item</th>
                <th className="py-2">Type</th>
                <th className="py-2">Total</th>
                <th className="py-2">Available now</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.item_id} className="border-b">
                  <td className="py-2">{r.name}</td>
                  <td className="py-2 capitalize">{r.type}</td>
                  <td className="py-2">{r.total_stock}</td>
                  <td className="py-2">{r.available_now}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
