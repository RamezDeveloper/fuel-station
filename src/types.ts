export type FuelId = "petrol" | "diesel" | "gas";

export interface FuelMeta {
  id: FuelId;
  label: string;
  color: string;
  unit: string;
}

export const FUELS: FuelMeta[] = [
  { id: "petrol", label: "پترول (بنزین)", color: "#22c55e", unit: "لیتر" },
  { id: "diesel", label: "دیزل", color: "#f59e0b", unit: "لیتر" },
  { id: "gas", label: "گاز", color: "#3b82f6", unit: "کیلوگرم" },
];

export type Prices = Record<FuelId, number>;

export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  fuel: FuelId;
  quantity: number;
  pricePerUnit: number;
  total: number;
  note?: string;
}

export type InventoryKind = "import" | "export";

export interface InventoryMovement {
  id: string;
  date: string; // YYYY-MM-DD
  fuel: FuelId;
  kind: InventoryKind; // import = واردات, export = صادرات/خروج دستی
  quantity: number;
  note?: string;
}

export interface AppData {
  prices: Prices;
  sales: Sale[];
  movements: InventoryMovement[];
}

export const DEFAULT_DATA: AppData = {
  prices: { petrol: 0, diesel: 0, gas: 0 },
  sales: [],
  movements: [],
};

export function fuelMeta(id: FuelId): FuelMeta {
  return FUELS.find((f) => f.id === id) ?? FUELS[0];
}
