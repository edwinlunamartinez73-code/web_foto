import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, X } from "lucide-react";
import { supabase } from "../supabaseClient";

type Photo = {
  id: string | number;
  title: string;
  description: string | null;
  storage_path: string;
  image_url: string;
  is_published: boolean;
  created_at?: string;
};

function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const loadPhotos = async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("id, title, description, storage_path, is_published, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setErrorMessage(`No se pudieron cargar las fotografías: ${error.message}`);
      } else {
        const photosWithUrls = (data ?? []).map((photo) => ({
          ...photo,
          image_url: supabase.storage.from("photos").getPublicUrl(photo.storage_path).data.publicUrl,
        }));
        setPhotos(photosWithUrls);
      }
      setLoading(false);
    };
    void loadPhotos();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  return (
    <>
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-8 sm:pt-20">
        <section className="mb-12 grid gap-8 border-b border-slate-800 pb-12 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Historias en imágenes</p>
            <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">
              El momento <span className="italic text-slate-400">captado</span> en imagen.
            </h1>
          </div>
          <a href="#fotos" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
            Explorar galería <ArrowDown size={16} />
          </a>
        </section>

        <div id="fotos" className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selección curada</p>
            <h2 className="mt-2 font-serif text-3xl">Fotografías</h2>
          </div>
          {!loading && <span className="text-sm text-slate-400">{photos.length} imágenes</span>}
        </div>

        {errorMessage && (
          <p className="rounded-2xl border border-red-900 bg-red-950/70 p-5 text-sm text-red-200" role="alert">
            {errorMessage}
          </p>
        )}
        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
          </div>
        ) : photos.length === 0 && !errorMessage ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-20 text-center">
            <p className="font-serif text-2xl">Aún no hay fotografías publicadas.</p>
            <p className="mt-2 text-sm text-slate-400">Vuelve pronto para descubrir nuevas historias.</p>
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {photos.map((photo, index) => (
              <motion.button
                key={photo.id}
                type="button"
                onClick={() => setSelected(photo)}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ delay: Math.min(index * 0.06, 0.45), duration: 0.45 }}
                whileHover={{ y: -4, scale: 1.012 }}
                whileTap={{ scale: 0.99 }}
                style={{ willChange: "transform, opacity" }}
                className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-slate-900 text-left shadow-xl shadow-black/20 transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(56,189,248,0.18)]"
              >
                <div className="relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-transparent transition-colors duration-500 group-hover:border-sky-200/50" />
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    loading="lazy"
                    className="max-h-[680px] min-h-48 w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 transition group-hover:opacity-90" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="font-serif text-2xl">{photo.title}</p>
                    {photo.description && <p className="mt-1 line-clamp-2 text-sm text-white/80">{photo.description}</p>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-stone-950/90 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            <motion.article
              role="dialog"
              aria-modal="true"
              aria-label={selected.title}
              className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white md:grid-cols-[1.4fr_0.6fr]"
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <button
                type="button"
                aria-label="Cerrar fotografía"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/75 md:right-[calc(40%-3rem)]"
              >
                <X size={20} />
              </button>
              <div className="grid min-h-0 place-items-center bg-black">
                <img src={selected.image_url} alt={selected.title} className="max-h-[68vh] w-full object-contain md:max-h-[92vh]" />
              </div>
              <div className="overflow-y-auto p-6 sm:p-9 md:self-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Edwin_FOTOGRAFIA · Galería</p>
                <h2 className="mt-4 font-serif text-3xl sm:text-4xl">{selected.title}</h2>
                {selected.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{selected.description}</p>}
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Gallery;
