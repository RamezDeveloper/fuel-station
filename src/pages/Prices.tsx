import { useState } from "react";
import { FUELS, type Prices as PricesType } from "../types";
import { fmtMoney } from "../utils";

interface Props {
  prices: PricesType;
  onSave: (p: PricesType) => void;
}

export default function Prices({ prices, onSave }: Props) {
  const [draft, setDraft] = useState<PricesType>(prices);
  const [saved, setSaved] = useState(false);

  function update(id: keyof PricesType, value: string) {
    setSaved(false);
    setDraft((d) => ({ ...d, [id]: Number(value) || 0 }));
  }

  function save() {
    onSave(draft);
    setSaved(true);
  }

  return (
    <div>
      <div className="section-title">💰 قیمت سوخت‌ها</div>
      <p className="hint">قیمت هر واحد سوخت را تعیین کنید. این قیمت‌ها هنگام ثبت فروش استفاده می‌شوند.</p>
      <div className="grid cards">
        {FUELS.map((f) => (
          <div className="card" key={f.id}>
            <h3>
              <span className="dot" style={{ background: f.color }} />
              {f.label}
            </h3>
            <label>قیمت هر {f.unit} (افغانی)</label>
            <input
              type="number"
              min={0}
              value={draft[f.id] || ""}
              onChange={(e) => update(f.id, e.target.value)}
            />
            <div className="stat" style={{ marginTop: 10 }}>
              <div className="sub">قیمت فعلی: {fmtMoney(prices[f.id])}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn" onClick={save}>
          ذخیره قیمت‌ها
        </button>
        {saved && <span style={{ color: "var(--green)" }}>✓ ذخیره شد</span>}
      </div>
    </div>
  );
}
