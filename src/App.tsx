import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./supabaseClient";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import Contact from "./components/Contact";
import Gallery from "./components/Gallery";
import Navbar from "./components/Navbar";

type Profile = {
  role: "admin" | "user";
  display_name: string | null;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [adminView, setAdminView] = useState(false);
  const [activeSection, setActiveSection] = useState<"gallery" | "contact">("gallery");

  useEffect(() => {
    let active = true;

    const loadProfile = async (user: User | null) => {
      if (!user) {
        if (active) {
          setProfile(null);
          setProfileError("");
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        setProfile(null);
        setProfileError(`No se pudo cargar tu perfil: ${error.message}`);
        return;
      }

      setProfile({
        role: data?.role === "admin" ? "admin" : "user",
        display_name: data?.display_name ?? null,
      });
      setProfileError("");
    };

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) setProfileError(`No se pudo recuperar la sesión: ${error.message}`);
      setSession(data.session);
      await loadProfile(data.session?.user ?? null);
      if (active) setLoading(false);
    };

    void initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(null);
      setAdminView(false);
      window.setTimeout(() => {
        void loadProfile(nextSession?.user ?? null);
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setProfileError(`No se pudo cerrar sesión: ${error.message}`);
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
      </main>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar
        user={session?.user ?? null}
        profile={profile}
        isAdmin={isAdmin}
        adminView={adminView}
        activeSection={activeSection}
        onOpenAuth={() => setAuthOpen(true)}
        onSignOut={() => void handleSignOut()}
        onToggleView={() => {
          setAdminView((view) => !view);
          setActiveSection("gallery");
        }}
        onSelectSection={(section) => {
          setAdminView(false);
          setActiveSection(section);
        }}
      />
      {profileError && (
        <div className="mx-auto mt-4 max-w-7xl px-6" role="alert">
          <p className="rounded-xl border border-red-900 bg-red-950/70 px-4 py-3 text-sm text-red-200">
            {profileError}
          </p>
        </div>
      )}
      <AnimatePresence mode="wait">
        {adminView && isAdmin ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <AdminPanel user={session!.user} />
          </motion.div>
        ) : activeSection === "contact" ? (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <Contact />
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <Gallery />
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default App;
