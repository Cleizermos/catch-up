import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Item } from "@/lib/search";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const all: Item[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("items")
          .select("id,name,keywords,tent,spot")
          .order("created_at", { ascending: false })
          .range(from, from + 999);
        if (error || !data) break;
        all.push(...data);
        if (data.length < 1000) break;
      }
      if (alive) {
        setItems(all);
        setLoading(false);
      }
    }
    load();
    const ch = supabase
      .channel(`items-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, (p) => {
        setItems((cur) => {
          if (p.eventType === "DELETE") return cur.filter((i) => i.id !== (p.old as Item).id);
          const row = p.new as Item;
          const rest = cur.filter((i) => i.id !== row.id);
          return [row, ...rest];
        });
      })
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, []);

  return { items, loading };
}
