import api from "../../../shared/services/api";
import {
  readJsonStorage,
  removeStorageKey,
  writeJsonStorage,
} from "../../../shared/services/localStorage";

const LATEST_SALES_CACHE_KEY = "tropical.latestSales.cache.v1";
const PENDING_SALES_KEY = "tropical.pendingSales.queue.v1";
const SALES_EVENT_NAME = "tropical-offline-sales-updated";
const MAX_LATEST_SALES = 30;
const SALES_TIME_ZONE = "America/Bogota";

function dispatchSalesUpdate() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(SALES_EVENT_NAME));
}

function buildPendingSaleId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `pending-${globalThis.crypto.randomUUID()}`;
  }

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    const randomHex = Array.from(bytes, (value) =>
      value.toString(16).padStart(2, "0"),
    ).join("");

    return `pending-${randomHex}`;
  }

  return `pending-${Date.now()}`;
}

function normalizeQuantity(value) {
  return Number(value ?? 0);
}

function normalizeDate(value) {
  if (!value) {
    return formatSaleDate(new Date());
  }

  return String(value);
}

function parseSaleDate(value) {
  if (!value) {
    return 0;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const raw = String(value).trim();
  const nativeValue = Date.parse(raw);
  if (!Number.isNaN(nativeValue)) {
    return nativeValue;
  }

  const match = raw.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+(AM|PM)$/i,
  );

  if (!match) {
    return 0;
  }

  const [, day, month, year, hourRaw, minute, dayPeriod] = match;
  let hour = Number(hourRaw);

  if (dayPeriod.toUpperCase() === "PM" && hour < 12) {
    hour += 12;
  }

  if (dayPeriod.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    hour,
    Number(minute),
  );
}

function getPendingSales() {
  const pending = readJsonStorage(PENDING_SALES_KEY, []);
  return Array.isArray(pending) ? pending : [];
}

function setPendingSales(items) {
  writeJsonStorage(PENDING_SALES_KEY, items);
  dispatchSalesUpdate();
}

function getLatestSalesCache() {
  const sales = readJsonStorage(LATEST_SALES_CACHE_KEY, []);
  return Array.isArray(sales) ? sales : [];
}

function setLatestSalesCache(sales) {
  writeJsonStorage(LATEST_SALES_CACHE_KEY, sales.slice(0, MAX_LATEST_SALES));
}

function formatSaleDate(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SALES_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const valueByType = parts.reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }

    return acc;
  }, {});

  return [
    `${valueByType.day}/${valueByType.month}/${valueByType.year}`,
    `${valueByType.hour}:${valueByType.minute} ${(valueByType.dayPeriod ?? "").toUpperCase()}`.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function saleRowIdentity(row) {
  return JSON.stringify([
    row.machine ?? "",
    row.flavor ?? "",
    row.feature ?? "",
    row.size ?? "",
    normalizeQuantity(row.quantity),
    row.date ?? "",
  ]);
}

function toPendingSaleRow(item, sale, options = {}) {
  const isUnsynced = options.unsynced !== false;

  return {
    id: `${isUnsynced ? "pending" : "synced"}-${sale.id}-${item.productMatrixId}-${item.size ?? "na"}`,
    machine: item.machineName ?? item.machine ?? "Sin máquina",
    flavor: item.flavor ?? item.baseName ?? item.productName ?? "Producto",
    feature: item.feature ?? "",
    size: item.sizeLabel ?? item.size ?? "",
    quantity: normalizeQuantity(item.quantity),
    date: normalizeDate(options.date ?? sale.createdAt),
    __sortDate: options.sortDate ?? sale.createdAt,
    __unsynced: isUnsynced,
    __localOrigin: true,
    __pendingSaleId: sale.id,
  };
}

function toPendingRows(queue, options) {
  return sortSalesDesc(
    queue.flatMap((sale) =>
      (sale.items ?? []).map((item) => toPendingSaleRow(item, sale, options)),
    ),
  );
}

function sortSalesDesc(rows) {
  return [...rows].sort((left, right) => {
    const leftTime = parseSaleDate(left.__sortDate ?? left.date ?? "");
    const rightTime = parseSaleDate(right.__sortDate ?? right.date ?? "");

    return rightTime - leftTime;
  });
}

function mergeVisibleSales(serverSales = [], localRows = []) {
  const normalizedServerRows = Array.isArray(serverSales) ? serverSales : [];
  const serverKeys = new Set(normalizedServerRows.map(saleRowIdentity));
  const preservedLocalRows = (Array.isArray(localRows) ? localRows : []).filter(
    (row) => {
      if (row.__unsynced) {
        return true;
      }

      return !serverKeys.has(saleRowIdentity(row));
    },
  );

  return sortSalesDesc([...preservedLocalRows, ...normalizedServerRows]).slice(
    0,
    MAX_LATEST_SALES,
  );
}

function replaceLocalRows(saleIds, replacementRows = []) {
  const ids = new Set((Array.isArray(saleIds) ? saleIds : []).map(String));
  const existing = getLatestSalesCache().filter(
    (row) => !ids.has(String(row.__pendingSaleId ?? "")),
  );

  setLatestSalesCache(mergeVisibleSales(existing, replacementRows));
  dispatchSalesUpdate();
}

export function cacheLatestSales(sales) {
  const existingLocalRows = getLatestSalesCache().filter(
    (row) => row.__localOrigin,
  );
  setLatestSalesCache(mergeVisibleSales(sales, existingLocalRows));
  dispatchSalesUpdate();
}

export function readCachedLatestSales() {
  return getLatestSalesCache();
}

export function mergeSalesWithPending(
  serverSales = [],
  pendingSales = getPendingSales(),
) {
  const pendingRows = toPendingRows(pendingSales);
  const used = new Set(pendingRows.map(saleRowIdentity));

  const mergedServerRows = (
    Array.isArray(serverSales) ? serverSales : []
  ).filter((row) => {
    const key = saleRowIdentity(row);
    if (used.has(key)) {
      used.delete(key);
      return false;
    }

    return true;
  });

  return [...pendingRows, ...mergedServerRows].slice(0, MAX_LATEST_SALES);
}

function prependPendingRowsToCache(sale) {
  replaceLocalRows([sale.id], toPendingRows([sale]));
}

export function queuePendingSale(items) {
  const queue = getPendingSales();
  const entry = {
    id: buildPendingSaleId(),
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({
      productMatrixId: Number(item.productMatrixId ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
      quantity: Number(item.quantity ?? 0),
      subtotal: Number(item.subtotal ?? 0),
      machineId: item.machineId ?? null,
      maquinaConfId: item.maquinaConfId ?? null,
      toppings: Number(item.toppings ?? 0),
      delivery: Number(item.delivery ?? 0),
      productName: item.productName ?? "Producto",
      baseName: item.baseName ?? item.productName ?? "Producto",
      flavor: item.flavor ?? item.baseName ?? item.productName ?? "Producto",
      feature: item.feature ?? "",
      sizeLabel: item.sizeLabel ?? "",
      machineName: item.machineName ?? item.machine ?? "",
    })),
  };

  const nextQueue = [entry, ...queue];
  setPendingSales(nextQueue);
  prependPendingRowsToCache(entry);

  return entry;
}

export async function registerSaleDirect(items) {
  const response = await api.post(
    "/api/sales",
    items.map((item) => ({
      productMatrixId: Number(item.productMatrixId ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
      quantity: Number(item.quantity ?? 0),
      subtotal: Number(item.subtotal ?? 0),
      machineId: item.machineId ?? null,
      maquinaConfId: item.maquinaConfId ?? null,
      toppings: Number(item.toppings ?? 0),
      delivery: Number(item.delivery ?? 0),
    })),
  );

  return response.data;
}

export async function syncPendingSales() {
  const queue = getPendingSales();

  if (!queue.length) {
    return { synced: 0, remaining: 0 };
  }

  let synced = 0;
  const syncedSales = [];
  const remaining = [];

  for (const sale of queue) {
    try {
      await registerSaleDirect(sale.items ?? []);
      synced += 1;
      syncedSales.push(sale);
    } catch {
      remaining.push(sale);
    }
  }

  if (remaining.length) {
    setPendingSales(remaining);
  } else {
    removeStorageKey(PENDING_SALES_KEY);
    dispatchSalesUpdate();
  }

  if (syncedSales.length) {
    const syncedAt = new Date();
    const syncedRows = toPendingRows(syncedSales, {
      unsynced: false,
      date: formatSaleDate(syncedAt),
      sortDate: syncedAt.toISOString(),
    });

    replaceLocalRows(
      syncedSales.map((sale) => sale.id),
      syncedRows,
    );
  }

  return {
    synced,
    remaining: remaining.length,
  };
}

export function getSalesEventName() {
  return SALES_EVENT_NAME;
}
