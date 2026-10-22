import { Aperture, LogIn, LogOut, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type Profile = {
  role: "admin" | "user";
  display_name: string | null;
};

type NavbarProps = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  adminView: boolean;
  activeSection: "gallery" | "contact";
  onOpenAuth: () => void;
  onSignOut: () => void;
  onToggleView: () => void;
  onSelectSection: (section: "gallery" | "contact") => void;
};

function Navbar({
  user,
  profile,
  isAdmin,
  adminView,
  activeSection,
  onOpenAuth,
  onSignOut,
  onToggleView,
  onSelectSection,
}: NavbarProps) {
  const name = profile?.display_name || user?.email;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 text-white backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-8 sm:py-4">
        <a
          href="#"
          onClick={() => onSelectSection("gallery")}
          className="group flex min-w-0 items-center gap-3"
          aria-label="Edwin Luna, inicio"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-sky-300/40 bg-slate-900 text-white shadow-[0_0_18px_rgba(56,189,248,0.12)] transition-transform group-hover:rotate-12 sm:h-10 sm:w-10">
            <Aperture size={20} strokeWidth={1.7} />
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-[11px] font-semibold tracking-[0.13em] sm:text-base sm:tracking-[0.18em]">EDWIN LUNA</span>
            <span className="mt-0.5 block whitespace-nowrap text-[8px] font-medium tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-[0.18em]">
              Edwin_FOTOGRAFIA
            </span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {!adminView && (
            <div className="order-3 flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto sm:gap-2">
              <button
                type="button"
                onClick={() => onSelectSection("gallery")}
                aria-current={activeSection === "gallery" ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                  activeSection === "gallery" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Galería
              </button>
              <button
                type="button"
                onClick={() => onSelectSection("contact")}
                aria-current={activeSection === "contact" ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                  activeSection === "contact" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Contacto
              </button>
            </div>
          )}
          {user ? (
            <>
              <span className="hidden max-w-48 truncate text-sm text-slate-400 sm:block">
                Hola, <span className="font-medium text-white">{name}</span>
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onToggleView}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-sky-200 hover:bg-slate-800"
                >
                  <ShieldCheck size={16} />
                  <span>{adminView ? "Galería" : <><span className="sm:hidden">Admin</span><span className="hidden sm:inline">Panel Admin</span></>}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-950 transition hover:bg-slate-200 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <LogIn size={16} />
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}


export default Navbar;
