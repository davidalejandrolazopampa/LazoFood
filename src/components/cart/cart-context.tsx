"use client";

import { useSyncExternalStore } from "react";

export type CartLine = {
  productId: string;
  name: string;
  unit: string;
  price: number; // precio de referencia al momento de agregar al carrito
  quantity: number;
};

const STORAGE_KEY = "lazofood:cart";
const EMPTY_LINES: CartLine[] = [];

// Store externo a React (módulo-singleton) persistido en localStorage.
// Se usa con useSyncExternalStore para que el cliente lea su estado real en
// la primera pintura sin generar un setState dentro de un efecto, y sin
// desajustes de hidratación: durante SSR/hidratación se usa getServerSnapshot
// (array vacío) y React re-sincroniza solo después de montar.
let lines: CartLine[] = EMPTY_LINES;
const listeners = new Set<() => void>();

function readFromStorage(): CartLine[] {
  if (typeof window === "undefined") return EMPTY_LINES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY_LINES;
  } catch {
    return EMPTY_LINES;
  }
}

if (typeof window !== "undefined") {
  lines = readFromStorage();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // localStorage no disponible (modo privado, etc.): no persiste entre sesiones.
  }
}

function setLines(updater: CartLine[] | ((prev: CartLine[]) => CartLine[])) {
  lines = typeof updater === "function" ? updater(lines) : updater;
  persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return lines;
}

function getServerSnapshot() {
  return EMPTY_LINES;
}

function addLine(line: Omit<CartLine, "quantity">, quantity: number) {
  setLines((prev) => {
    const existing = prev.find((l) => l.productId === line.productId);
    if (existing) {
      return prev.map((l) =>
        l.productId === line.productId
          ? { ...l, quantity: l.quantity + quantity }
          : l
      );
    }
    return [...prev, { ...line, quantity }];
  });
}

function updateQuantity(productId: string, quantity: number) {
  setLines((prev) =>
    quantity <= 0
      ? prev.filter((l) => l.productId !== productId)
      : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l))
  );
}

function removeLine(productId: string) {
  setLines((prev) => prev.filter((l) => l.productId !== productId));
}

function clear() {
  setLines(EMPTY_LINES);
}

export function useCart() {
  const currentLines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const itemCount = currentLines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = currentLines.reduce((sum, l) => sum + l.quantity * l.price, 0);

  return {
    lines: currentLines,
    addLine,
    updateQuantity,
    removeLine,
    clear,
    itemCount,
    subtotal,
  };
}
