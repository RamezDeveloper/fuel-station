import { useState } from "react";
import {
  FUELS,
  type AppData,
  type FuelId,
  type InventoryKind,
  type InventoryMovement,
  fuelMeta,
} from "../types";
import { stockFor } from "../store";
import { fmt, fmtDate, todayISO } from "../utils";

interface Props {
  data: AppData;
  onAdd: (m: Omit<InventoryMovement, "id">) => void;
  onRemove: (id: string) => void;
}

export default function Inventory({ data, onAdd, onRemove }: Props) {
  const [date, setDate] = useState(todayISO());
  const [fuel, setFuel] = useState<FuelId>("petrol");
  const [kind, setKind] = useState<InventoryKind>("import");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(quantity);
    if (!q || q <= 0) return;
    onAdd({ date, fuel, kind, quantity: q, note: note.trim() || undefined });
    setQuantity("");
    setNote("");
  }

  return (
    <div>
      <div className="section-title">🛢️ موجودی — واردات و صادرات</div>
      <p className="hint">
        واردات = تحویل و ورود سوخت به مخزن. صادرات = خروج دستی سوخت (به‌جز فروش). موجودی باقی‌مانده به‌طور
        خودکار محاسبه می‌شود (واردات − صادرات − فروش).
      </p>

      <div className="grid cards">
        {FUELS.map((f) => {
          const stock = stockFor(data, f.id);
          return (
            <div className="card stat" key={f.id}>
              <h3>
                <span className="dot" style={{ background: f.color }} />
                {f.label}
              </h3>
              <div
                className="value"
                style={{ color: stock < 0 ? "var(--red)" : "var(--text)" }}
              >
                {fmt(stock)} <span style={{ fontSize: 14, color: "var(--muted)" }}>{f.unit}</span>
              </div>
              <div className="sub">موجودی فعلی</div>
            </div>
          );
        })}
      </div>

      <form className="card" onSubmit={submit} style={{ marginTop: 20 }}>
        <div className="form-grid">
          <div>
            <label>تاریخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>نوع سوخت</label>
            <select value={fuel} onChange={(e) => setFuel(e.target.value as FuelId)}>
              {FUELS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>نوع حرکت</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as InventoryKind)}>
              <option value="import">واردات (ورود)</option>
              <option value="export">صادرات (خروج)</option>
            </select>
          </div>
          <div>
            <label>مقدار ({fuelMeta(fuel).unit})</label>
            <input
              type="number"
              min={0}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label>توضیحات (اختیاری)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="..." />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn" type="submit">
            ثبت حرکت
          </button>
        </div>
      </form>

      <div className="section-title">📦 سوابق واردات و صادرات</div>
      {data.movements.length === 0 ? (
        <div className="card empty">هنوز حرکتی ثبت نشده است.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>سوخت</th>
                <th>نوع</th>
                <th>مقدار</th>
                <th>توضیحات</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.movements.map((m) => {
                const meta = fuelMeta(m.fuel);
                return (
                  <tr key={m.id}>
                    <td>{fmtDate(m.date)}</td>
                    <td>
                      <span className="dot" style={{ background: meta.color }} />
                      {meta.label}
                    </td>
                    <td>
                      <span className={`badge ${m.kind === "import" ? "in" : "out"}`}>
                        {m.kind === "import" ? "واردات" : "صادرات"}
                      </span>
                    </td>
                    <td>
                      {fmt(m.quantity)} {meta.unit}
                    </td>
                    <td>{m.note ?? "—"}</td>
                    <td>
                      <button className="btn danger" onClick={() => onRemove(m.id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
