"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Toaster, toast } from "sonner";
import { Data, Role, Action, transact } from "./domain";
import { seed } from "./seed";
const KEY = "avenza-concept-v1";
type Store = {
  data: Data;
  ready: boolean;
  role: Role | null;
  setRole: (r: Role | null) => void;
  act: (a: Action) => { ok: boolean; id?: string };
  reset: () => void;
  currency: string;
  setCurrency: (c: string) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(seed);
  const [ready, setReady] = useState(false);
  const [role, setRoleState] = useState<Role | null>(null);
  const [currency, setCurrency] = useState("DOP");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.version === 1 &&
          Array.isArray(parsed.vehicles) &&
          Array.isArray(parsed.reservations)
        )
          setData(parsed);
      }
      const r = sessionStorage.getItem("avenza-role");
      if (r === "Administrador" || r === "Operaciones") setRoleState(r);
    } catch {
      toast.error(
        "No pudimos recuperar los cambios. Cargamos los datos de demostración.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch {
        toast.error(
          "El almacenamiento está lleno. Reduce el tamaño de las fotos para conservar los cambios.",
        );
      }
  }, [data, ready]);
  const setRole = (r: Role | null) => {
    setRoleState(r);
    if (r) sessionStorage.setItem("avenza-role", r);
    else sessionStorage.removeItem("avenza-role");
  };
  const act = useCallback(
    (a: Action) => {
      try {
        const result = transact(data, a, role || "Operaciones");
        const serialized = JSON.stringify(result.data);
        localStorage.setItem(KEY, serialized);
        setData(result.data);
        toast.success(result.message);
        return { ok: true, id: result.id };
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "No pudimos guardar el cambio.",
        );
        return { ok: false };
      }
    },
    [data, role],
  );
  const reset = () => {
    const d = seed();
    localStorage.setItem(KEY, JSON.stringify(d));
    setData(d);
    toast.success("Demo restaurada a su estado inicial.");
  };
  return (
    <Context.Provider
      value={{ data, ready, role, setRole, act, reset, currency, setCurrency }}
    >
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ duration: 5000 }}
      />
    </Context.Provider>
  );
}
export function useStore() {
  const s = useContext(Context);
  if (!s) throw Error("Falta StoreProvider");
  return s;
}
