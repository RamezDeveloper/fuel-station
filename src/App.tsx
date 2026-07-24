import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Prices from "./pages/Prices";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import { useStore } from "./store";

type Tab = "dashboard" | "sales" | "inventory" | "prices";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "داشبورد" },
  { id: "sales", label: "فروش" },
  { id: "inventory", label: "موجودی" },
  { id: "prices", label: "قیمت‌ها" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const store = useStore();

  function confirmReset() {
    if (window.confirm("همه داده‌ها پاک شوند؟ این عمل قابل بازگشت نیست.")) {
      store.resetAll();
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">⛽</div>
          <div>
            <h1>سیستم مدیریت پمپ بنزین</h1>
            <p>مدیریت قیمت، فروش و موجودی سوخت</p>
          </div>
        </div>
        <nav className="nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
          <button className="secondary-reset" onClick={confirmReset} title="پاک کردن داده‌ها">
            🗑️
          </button>
        </nav>
      </header>

      <main>
        {tab === "dashboard" && <Dashboard data={store.data} />}
        {tab === "sales" && (
          <Sales
            sales={store.data.sales}
            prices={store.data.prices}
            onAdd={store.addSale}
            onRemove={store.removeSale}
          />
        )}
        {tab === "inventory" && (
          <Inventory data={store.data} onAdd={store.addMovement} onRemove={store.removeMovement} />
        )}
        {tab === "prices" && <Prices prices={store.data.prices} onSave={store.setPrices} />}
      </main>
    </div>
  );
}
