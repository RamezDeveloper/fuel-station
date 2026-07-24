import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FUELS, type AppData } from "../types";
import { stockFor } from "../store";
import { fmt, fmtMoney, todayISO } from "../utils";

interface Props {
  data: AppData;
}

export default function Dashboard({ data }: Props) {
  const today = todayISO();

  const totalRevenue = useMemo(
    () => data.sales.reduce((s, x) => s + x.total, 0),
    [data.sales],
  );

  const todayRevenue = useMemo(
    () =>
      data.sales
        .filter((s) => s.date === today)
        .reduce((s, x) => s + x.total, 0),
    [data.sales, today],
  );

  const totalImported = useMemo(
    () =>
      data.movements
        .filter((m) => m.kind === "import")
        .reduce((s, m) => s + m.quantity, 0),
    [data.movements],
  );

  const totalExported = useMemo(
    () =>
      data.movements
        .filter((m) => m.kind === "export")
        .reduce((s, m) => s + m.quantity, 0),
    [data.movements],
  );

  // last 14 days revenue
  const daily = useMemo(() => {
    const days: { date: string; label: string; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = new Intl.DateTimeFormat("fa-IR", {
        month: "numeric",
        day: "numeric",
      }).format(d);
      const revenue = data.sales
        .filter((s) => s.date === iso)
        .reduce((s, x) => s + x.total, 0);
      days.push({ date: iso, label, revenue });
    }
    return days;
  }, [data.sales]);

  const byFuel = useMemo(
    () =>
      FUELS.map((f) => ({
        name: f.label,
        color: f.color,
        revenue: data.sales
          .filter((s) => s.fuel === f.id)
          .reduce((s, x) => s + x.total, 0),
        quantity: data.sales
          .filter((s) => s.fuel === f.id)
          .reduce((s, x) => s + x.quantity, 0),
      })),
    [data.sales],
  );

  const hasSales = data.sales.length > 0;

  return (
    <div>
      <div className="section-title">📊 داشبورد</div>
      <div className="grid cards">
        <div className="card stat">
          <h3>درآمد امروز</h3>
          <div className="value" style={{ color: "var(--green)" }}>{fmtMoney(todayRevenue)}</div>
          <div className="sub">{new Intl.DateTimeFormat("fa-IR").format(new Date())}</div>
        </div>
        <div className="card stat">
          <h3>مجموع درآمد</h3>
          <div className="value">{fmtMoney(totalRevenue)}</div>
          <div className="sub">{fmt(data.sales.length)} فروش ثبت‌شده</div>
        </div>
        <div className="card stat">
          <h3>مجموع واردات</h3>
          <div className="value" style={{ color: "var(--accent)" }}>{fmt(totalImported)}</div>
          <div className="sub">مجموع ورودی به مخازن</div>
        </div>
        <div className="card stat">
          <h3>مجموع صادرات</h3>
          <div className="value" style={{ color: "var(--amber)" }}>{fmt(totalExported)}</div>
          <div className="sub">مجموع خروجی دستی</div>
        </div>
      </div>

      <div className="section-title">موجودی مخازن</div>
      <div className="grid cards">
        {FUELS.map((f) => {
          const stock = stockFor(data, f.id);
          return (
            <div className="card stat" key={f.id}>
              <h3>
                <span className="dot" style={{ background: f.color }} />
                {f.label}
              </h3>
              <div className="value" style={{ color: stock < 0 ? "var(--red)" : "var(--text)" }}>
                {fmt(stock)} <span style={{ fontSize: 13, color: "var(--muted)" }}>{f.unit}</span>
              </div>
              <div className="sub">موجودی باقی‌مانده</div>
            </div>
          );
        })}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", marginTop: 20 }}>
        <div className="card chart-card">
          <h3>درآمد ۱۴ روز اخیر</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} width={70} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10 }}
                formatter={(v) => [fmtMoney(Number(v)), "درآمد"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>سهم درآمد بر اساس سوخت</h3>
          {hasSales ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byFuel.filter((b) => b.revenue > 0)}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {byFuel
                    .filter((b) => b.revenue > 0)
                    .map((b) => (
                      <Cell key={b.name} fill={b.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(v) => fmtMoney(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">داده‌ای برای نمایش نیست.</div>
          )}
        </div>
      </div>

      <div className="card chart-card" style={{ marginTop: 20 }}>
        <h3>مقدار فروش بر اساس سوخت</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byFuel} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} width={70} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10 }}
              formatter={(v) => [fmt(Number(v)), "مقدار"]}
            />
            <Bar dataKey="quantity" radius={[8, 8, 0, 0]}>
              {byFuel.map((b) => (
                <Cell key={b.name} fill={b.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
