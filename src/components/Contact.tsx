import { motion } from "framer-motion";
import { ArrowUpRight, Phone, UserRound } from "lucide-react";

function Contact() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-5 py-16 sm:px-8 sm:py-24">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/30 md:grid-cols-[0.85fr_1.15fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-7 sm:min-h-80 sm:p-10"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-sky-300/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-sky-300/10" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Edwin_FOTOGRAFIA</p>
            <p className="mt-5 max-w-xs font-serif text-4xl leading-tight sm:text-5xl">
              Cada historia merece ser <span className="italic text-slate-400">capturada.</span>
            </p>
          </div>
          <p className="relative mt-10 text-sm tracking-wide text-slate-400">Fotografía con intención · México</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="p-7 sm:p-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Hablemos de tu proyecto</p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Contacto y contrataciones</h1>
          <div className="mt-8 flex items-start gap-4 border-b border-slate-800 pb-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-700 bg-slate-950 text-sky-200">
              <UserRound size={19} strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fotógrafo</p>
              <p className="mt-1 text-base font-medium leading-6 text-white sm:text-lg">Edwin Abaram Luna Martinez</p>
            </div>
          </div>

          <a
            href="https://wa.me/qr/WIDEJ7JOT6MPK1"
            target="_blank"
            rel="noreferrer"
            className="group mt-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4 transition duration-300 hover:border-emerald-300/70 hover:bg-emerald-400/[0.11] hover:shadow-[0_0_28px_rgba(52,211,153,0.12)] sm:p-5"
          >
            <span className="flex min-w-0 items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-4a8.2 8.2 0 1 1 15.1-4.3Z" />
                  <path d="M9 8.5c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.3-.1.5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.2.1.3.2.3.4v.6c0 .3-.2.6-.5.8-.5.3-1.1.5-1.7.4-1-.1-2.2-.7-3.5-1.8-1.2-1.1-2-2.3-2.3-3.4-.2-.8 0-1.5.4-2.2Z" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.16em] text-emerald-200/70">Escríbeme directamente</span>
                <span className="mt-1 block text-base font-medium text-white sm:text-lg">Enviar mensaje por WhatsApp</span>
              </span>
            </span>
            <ArrowUpRight size={19} className="shrink-0 text-emerald-200 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="tel:3326687499"
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-sky-300/40 hover:bg-slate-950"
            >
              <Phone size={18} className="shrink-0 text-sky-300" />
              <span>
                <span className="block text-xs text-slate-500">Teléfono</span>
                <span className="mt-1 block text-sm font-medium text-white">332 668 7499</span>
              </span>
            </a>
            <a
              href="https://www.instagram.com/el_momento_captado_en_imagen/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-sky-300/40 hover:bg-slate-950"
            >
              <span className="flex min-w-0 items-center gap-3">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
                </svg>
                <span className="min-w-0">
                  <span className="block text-xs text-slate-500">Instagram</span>
                  <span className="mt-1 block truncate text-sm font-medium text-white">@el_momento_captado_en_imagen</span>
                </span>
              </span>
              <ArrowUpRight size={16} className="shrink-0 text-slate-500" />
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

export default Contact;
