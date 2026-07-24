import { useCallback, useEffect, useState } from "react";
import {
  type AppData,
  type FuelId,
  type InventoryMovement,
  type Prices,
  type Sale,
  DEFAULT_DATA,
} from "./types";

const STORAGE_KEY = "fuel-station-data-v1";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      prices: { ...DEFAULT_DATA.prices, ...(parsed.prices ?? {}) },
      sales: parsed.sales ?? [],
      movements: parsed.movements ?? [],
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useStore() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setPrices = useCallback((prices: Prices) => {
    setData((d) => ({ ...d, prices }));
  }, []);

  const addSale = useCallback((sale: Omit<Sale, "id" | "total">) => {
    setData((d) => ({
      ...d,
      sales: [
        {
          ...sale,
          id: makeId(),
          total: sale.quantity * sale.pricePerUnit,
        },
        ...d.sales,
      ],
    }));
  }, []);

  const removeSale = useCallback((id: string) => {
    setData((d) => ({ ...d, sales: d.sales.filter((s) => s.id !== id) }));
  }, []);

  const addMovement = useCallback(
    (movement: Omit<InventoryMovement, "id">) => {
      setData((d) => ({
        ...d,
        movements: [{ ...movement, id: makeId() }, ...d.movements],
      }));
    },
    [],
  );

  const removeMovement = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      movements: d.movements.filter((m) => m.id !== id),
    }));
  }, []);

  const resetAll = useCallback(() => setData(DEFAULT_DATA), []);

  return {
    data,
    setPrices,
    addSale,
    removeSale,
    addMovement,
    removeMovement,
    resetAll,
  };
}

/** current stock per fuel = imports - exports - sold quantity */
export function stockFor(data: AppData, fuel: FuelId): number {
  const imported = data.movements
    .filter((m) => m.fuel === fuel && m.kind === "import")
    .reduce((s, m) => s + m.quantity, 0);
  const exported = data.movements
    .filter((m) => m.fuel === fuel && m.kind === "export")
    .reduce((s, m) => s + m.quantity, 0);
  const sold = data.sales
    .filter((s) => s.fuel === fuel)
    .reduce((s, x) => s + x.quantity, 0);
  return imported - exported - sold;
}
