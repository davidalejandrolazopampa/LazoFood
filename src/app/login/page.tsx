"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex flex-1 items-center justify-center bg-brand-cream px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <div className="flex justify-center">
          <Image src="/brand/logo.svg" alt="LazoFood" width={130} height={71} priority />
        </div>
        <h1 className="mt-6 text-center text-lg font-bold text-foreground">
          Panel interno
        </h1>
        <p className="mt-1 text-center text-sm text-foreground/60">
          Acceso para equipo LazoFood
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-foreground/80">Correo</span>
            <input
              name="email"
              type="email"
              required
              autoFocus
              defaultValue="demo@lazofood.pe"
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 focus:border-brand-sage focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground/80">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              defaultValue="demo1234"
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 focus:border-brand-sage focus:outline-none"
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-brand-sage px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-tomato disabled:opacity-60"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-5 rounded-lg bg-amber-50 p-3 text-center text-xs text-amber-800">
          Cuenta de demo para pruebas: <strong>demo@lazofood.pe</strong> /{" "}
          <strong>demo1234</strong> — ya viene rellenada arriba.
        </p>
      </div>
    </div>
  );
}
