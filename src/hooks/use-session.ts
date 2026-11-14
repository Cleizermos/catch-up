import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

export function useIsAdmin(userId?: string) {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    if (!userId) return setAdmin(false);
    supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").then(({ data }) => setAdmin(!!data?.length));
  }, [userId]);
  return admin;
}
