CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  keywords text NOT NULL DEFAULT '',
  tent text NOT NULL,
  spot text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team read" ON public.items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "team insert" ON public.items FOR INSERT TO anon, authenticated WITH CHECK (length(name) BETWEEN 1 AND 120 AND length(tent) BETWEEN 1 AND 40);
CREATE POLICY "team update" ON public.items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (length(name) BETWEEN 1 AND 120);
CREATE POLICY "team delete" ON public.items FOR DELETE TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
INSERT INTO public.items (name, keywords, tent, spot) VALUES
('Guarda-chuva amarelo','sombrinha chuva','Barraca 1','Caixa A'),
('Chave de fenda','ferramenta parafuso','Barraca 2','Prateleira de cima'),
('Pente','cabelo','Barraca 1','Caixa B'),
('Meia vermelha','roupa pé','Barraca 3','Saco azul'),
('Bola de tênis','esporte verde','Barraca 2','Cesto');