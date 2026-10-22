import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "../supabaseClient";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setSuccessMessage("Revisa tu correo para confirmar la cuenta.");
      return;
    }
    onClose();
    setPassword("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-7 text-white shadow-2xl sm:p-9"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={19} />
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Edwin_FOTOGRAFIA</p>
            <h2 id="auth-title" className="mt-3 font-serif text-3xl">
              {mode === "login" ? "Qué bueno verte." : "Únete a la comunidad."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {mode === "login"
                ? "Inicia sesión para continuar."
                : "Crea una cuenta con tu correo y una contraseña."}
            </p>

            <form className="mt-7 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <label className="block text-sm font-medium text-slate-200">
                Correo electrónico
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
                />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                Contraseña
                <input
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
                />
              </label>
              {errorMessage && <p className="text-sm text-red-300" role="alert">{errorMessage}</p>}
              {successMessage && <p className="text-sm text-emerald-300" role="status">{successMessage}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="font-semibold text-sky-300 underline underline-offset-4"
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
