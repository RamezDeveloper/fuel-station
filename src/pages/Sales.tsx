import { useMemo, useState } from "react";
import { FUELS, type FuelId, type Prices, type Sale, fuelMeta } from "../types";
import { fmt, fmtDate, fmtMoney, todayISO } from "../utils";

interface Props {
  sales: Sale[];
  prices: Prices;
  onAdd: (s: Omit<Sale, "id" | "total">) => void;
  onRemove: (id: string) => void;
}

export default function Sales({ sales, prices, onAdd, onRemove }: Props) {
  const [date, setDate] = useState(todayISO());
  const [fuel, setFuel] = useState<FuelId>("petrol");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState<string>("");
  const [note, setNote] = useState("");

  const effectivePrice = price !== "" ? Number(price) : prices[fuel];
  const total = (Number(quantity) || 0) * (effectivePrice || 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(quantity);
    if (!q || q <= 0) return;
    onAdd({
      date,
      fuel,
      quantity: q,
      pricePerUnit: effectivePrice || 0,
      note: note.trim() || undefined,
    });
    setQuantity("");
    setPrice("");
    setNote("");
  }

  const totalRevenue = useMemo(
    () => sales.reduce((s, x) => s + x.total, 0),
    [sales],
  );

  return (
    <div>
      <div className="section-title">🧾 ثبت فروش</div>
      <form className="card" onSubmit={submit}>
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
            <label>قیمت واحد (پیش‌فرض {fmt(prices[fuel])})</label>
            <input
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={String(prices[fuel] || 0)}
            />
          </div>
          <div>
            <label>توضیحات (اختیاری)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="..." />
          </div>
          <div>
            <label>مجموع</label>
            <input value={fmtMoney(total)} readOnly />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn" type="submit">
            ثبت فروش
          </button>
        </div>
      </form>

      <div className="row" style={{ margin: "22px 0 10px" }}>
        <div className="section-title" style={{ margin: 0 }}>
          📋 سوابق فروش
        </div>
        <div className="spacer" />
        <span className="sub" style={{ color: "var(--muted)" }}>
          مجموع درآمد: <strong style={{ color: "var(--green)" }}>{fmtMoney(totalRevenue)}</strong>
        </span>
      </div>

      {sales.length === 0 ? (
        <div className="card empty">هنوز فروشی ثبت نشده است.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>سوخت</th>
                <th>مقدار</th>
                <th>قیمت واحد</th>
                <th>مجموع</th>
                <th>توضیحات</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const m = fuelMeta(s.fuel);
                return (
                  <tr key={s.id}>
                    <td>{fmtDate(s.date)}</td>
                    <td>
                      <span className="dot" style={{ background: m.color }} />
                      {m.label}
                    </td>
                    <td>
                      {fmt(s.quantity)} {m.unit}
                    </td>
                    <td>{fmtMoney(s.pricePerUnit)}</td>
                    <td>{fmtMoney(s.total)}</td>
                    <td>{s.note ?? "—"}</td>
                    <td>
                      <button className="btn danger" onClick={() => onRemove(s.id)}>
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
