export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

const nf = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });

export function fmt(n: number): string {
  return nf.format(n);
}

export function fmtMoney(n: number): string {
  return nf.format(Math.round(n)) + " افغانی";
}

export function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR").format(new Date(iso));
  } catch {
    return iso;
  }
}
