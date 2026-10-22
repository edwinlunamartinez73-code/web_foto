import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { ImagePlus, Pencil, RefreshCw, Trash2, Upload, X } from "lucide-react";
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

type AdminPanelProps = { user: User };

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const IMAGE_TYPES_BY_MIME: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};

function getImageContentType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentTypeFromExtension = IMAGE_TYPES_BY_EXTENSION[extension];
  const normalizedMimeType = file.type.split(";")[0].trim().toLowerCase();

  return contentTypeFromExtension ?? IMAGE_TYPES_BY_MIME[normalizedMimeType] ?? null;
}

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "") || "imagen";
}

function AdminPanel({ user }: AdminPanelProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from("photos")
      .select("id, title, description, storage_path, is_published, created_at")
      .order("created_at", { ascending: false });
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
  }, []);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const uploadPhoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!file) {
      setErrorMessage("Selecciona una imagen antes de subirla.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("La imagen supera el límite de 10 MB. Selecciona una imagen más pequeña.");
      return;
    }
    const contentType = getImageContentType(file);
    if (!contentType) {
      setErrorMessage("El formato debe ser JPEG, PNG o WebP.");
      return;
    }

    setBusy(true);
    setErrorMessage("");
    setNotice("");
    let uploaded = false;
    try {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const path = `${user.id}/${uniqueId}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(path, file, {
        contentType: contentType || file.type || "image/jpeg",
        upsert: false,
      });
      if (uploadError) {
        setErrorMessage(`No se pudo subir la imagen: ${uploadError.message}`);
        return;
      }

      const { error: insertError } = await supabase.from("photos").insert({
        title: title.trim(),
        description: description.trim() || null,
        storage_path: path,
        is_published: false,
      });
      if (insertError) {
        const { error: cleanupError } = await supabase.storage.from("photos").remove([path]);
        const cleanupInfo = cleanupError ? ` También falló la limpieza del archivo: ${cleanupError.message}` : "";
        setErrorMessage(`No se pudo guardar la fotografía: ${insertError.message}.${cleanupInfo}`);
        return;
      }

      setTitle("");
      setDescription("");
      setFile(null);
      formElement.reset();
      setNotice("Fotografía subida como oculta. Puedes publicarla desde la lista.");
      uploaded = true;
    } catch (error) {
      if (error instanceof TypeError) {
        setErrorMessage("Error de red al subir la imagen. Verifica tu conexión e inténtalo de nuevo.");
      } else {
        const reason = error instanceof Error ? error.message : "Error inesperado.";
        setErrorMessage(`No se pudo completar la subida de la imagen: ${reason}`);
      }
    } finally {
      setBusy(false);
    }

    if (uploaded) await loadPhotos();
  };

  const togglePublished = async (photo: Photo) => {
    setErrorMessage("");
    const { error } = await supabase
      .from("photos")
      .update({ is_published: !photo.is_published })
      .eq("id", photo.id);
    if (error) {
      setErrorMessage(`No se pudo actualizar la publicación: ${error.message}`);
      return;
    }
    await loadPhotos();
  };

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    setErrorMessage("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase
      .from("photos")
      .update({
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim() || null,
      })
      .eq("id", editing.id);
    setBusy(false);
    if (error) {
      setErrorMessage(`No se pudieron guardar los cambios: ${error.message}`);
      return;
    }
    setEditing(null);
    setNotice("Cambios guardados.");
    await loadPhotos();
  };

  const deletePhoto = async (photo: Photo) => {
    if (!window.confirm(`¿Eliminar “${photo.title}”? Esta acción no se puede deshacer.`)) return;
    setErrorMessage("");
    setNotice("");
    if (!photo.storage_path) {
      setErrorMessage("No se puede eliminar el archivo porque el registro no contiene storage_path.");
      return;
    }
    const { error: storageError } = await supabase.storage.from("photos").remove([photo.storage_path]);
    if (storageError) {
      setErrorMessage(`No se pudo eliminar el archivo de Storage: ${storageError.message}`);
      return;
    }
    const { error: deleteError } = await supabase.from("photos").delete().eq("id", photo.id);
    if (deleteError) {
      setErrorMessage(`El archivo se eliminó de Storage, pero no se pudo eliminar el registro: ${deleteError.message}`);
      await loadPhotos();
      return;
    }
    setNotice("Fotografía y archivo eliminados.");
    await loadPhotos();
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Administración</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Tu colección</h1>
          <p className="mt-2 text-slate-300">Sube, organiza y publica fotografías.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadPhotos()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white transition hover:border-sky-300/60 hover:bg-slate-800"
        >
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {errorMessage && <p role="alert" className="mb-5 rounded-xl border border-red-900 bg-red-950/70 px-4 py-3 text-sm text-red-200">{errorMessage}</p>}
      {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-900 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

      <section className="mb-12 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-sky-300/30 bg-slate-800 text-sky-200"><ImagePlus size={19} /></span>
          <div>
            <h2 className="font-serif text-2xl">Añadir fotografía</h2>
            <p className="text-sm text-slate-400">JPG, PNG o WebP · Máximo 10 MB</p>
          </div>
        </div>
        <form onSubmit={(event) => void uploadPhoto(event)} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-200">
            Título
            <input
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
            />
          </label>
          <label className="text-sm font-medium text-slate-200">
            Archivo de imagen
            <input
              required
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                if (nextFile && nextFile.size > MAX_IMAGE_SIZE) {
                  setErrorMessage("La imagen supera el límite de 10 MB. Selecciona una imagen más pequeña.");
                  event.target.value = "";
                  setFile(null);
                  return;
                }
                if (nextFile && !getImageContentType(nextFile)) {
                  setErrorMessage("El formato debe ser JPEG, PNG o WebP.");
                  event.target.value = "";
                  setFile(null);
                  return;
                }
                setErrorMessage("");
                setFile(
                  nextFile
                    ? new File([nextFile], sanitizeFileName(nextFile.name), {
                        type: getImageContentType(nextFile) ?? nextFile.type ?? "image/jpeg",
                        lastModified: nextFile.lastModified,
                      })
                    : null,
                );
              }}
              className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-[0.65rem] text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:text-white"
            />
          </label>
          <label className="text-sm font-medium text-slate-200 md:col-span-2">
            Descripción
            <textarea
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60"
            >
              <Upload size={16} /> {busy ? "Subiendo..." : "Subir como oculta"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Biblioteca</p>
            <h2 className="mt-2 font-serif text-3xl">Todas las fotografías</h2>
          </div>
          <span className="text-sm text-slate-400">{photos.length} en total</span>
        </div>
        {loading ? (
          <div className="grid min-h-40 place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" /></div>
        ) : photos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-slate-400">Todavía no has subido fotografías.</p>
        ) : (
          <div className="space-y-3">
            {photos.map((photo) => (
              <article key={photo.id} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:p-4">
                <img src={photo.image_url} alt="" className="h-32 w-full rounded-xl object-cover sm:h-20 sm:w-28" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium">{photo.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${photo.is_published ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-300"}`}>
                      {photo.is_published ? "Publicada" : "Oculta"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{photo.description || "Sin descripción"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void togglePublished(photo)}
                    className="rounded-full border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-sky-300/50 hover:bg-slate-800"
                  >
                    {photo.is_published ? "Ocultar" : "Publicar"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Editar ${photo.title}`}
                    onClick={() => setEditing(photo)}
                    className="rounded-full border border-slate-700 p-2.5 text-slate-200 transition hover:border-sky-300/50 hover:bg-slate-800"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${photo.title}`}
                    onClick={() => void deletePhoto(photo)}
                    className="rounded-full border border-red-900 p-2.5 text-red-300 transition hover:bg-red-950"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="edit-title" className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-7 text-white shadow-2xl">
            <button type="button" aria-label="Cerrar edición" onClick={() => setEditing(null)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X size={19} />
            </button>
            <h2 id="edit-title" className="font-serif text-3xl">Editar fotografía</h2>
            <form onSubmit={(event) => void saveEdit(event)} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-200">
                Título
                <input name="title" required maxLength={120} defaultValue={editing.title} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-300" />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                Descripción
                <textarea name="description" rows={4} maxLength={2000} defaultValue={editing.description ?? ""} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-300" />
              </label>
              <button type="submit" disabled={busy} className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 hover:bg-slate-200 disabled:opacity-60">
                {busy ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminPanel;
