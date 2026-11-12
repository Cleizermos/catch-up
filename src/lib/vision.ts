/** COCO-SSD class → Portuguese name. */
export const COCO_PT: Record<string, string> = {
  person: "pessoa", bicycle: "bicicleta", car: "carro", motorcycle: "moto", airplane: "avião", bus: "ônibus", train: "trem", truck: "caminhão", boat: "barco",
  "traffic light": "semáforo", "fire hydrant": "hidrante", "stop sign": "placa de pare", "parking meter": "parquímetro", bench: "banco", bird: "pássaro", cat: "gato",
  dog: "cachorro", horse: "cavalo", sheep: "ovelha", cow: "vaca", elephant: "elefante", bear: "urso", zebra: "zebra", giraffe: "girafa", backpack: "mochila",
  umbrella: "guarda-chuva", handbag: "bolsa", tie: "gravata", suitcase: "mala", frisbee: "frisbee", skis: "esqui", snowboard: "snowboard", "sports ball": "bola",
  kite: "pipa", "baseball bat": "taco de beisebol", "baseball glove": "luva de beisebol", skateboard: "skate", surfboard: "prancha de surfe", "tennis racket": "raquete de tênis",
  bottle: "garrafa", "wine glass": "taça", cup: "copo", fork: "garfo", knife: "faca", spoon: "colher", bowl: "tigela", banana: "banana", apple: "maçã",
  sandwich: "sanduíche", orange: "laranja", broccoli: "brócolis", carrot: "cenoura", "hot dog": "cachorro-quente", pizza: "pizza", donut: "rosquinha", cake: "bolo",
  chair: "cadeira", couch: "sofá", "potted plant": "vaso de planta", bed: "cama", "dining table": "mesa", toilet: "vaso sanitário", tv: "televisão", laptop: "notebook",
  mouse: "mouse", remote: "controle remoto", keyboard: "teclado", "cell phone": "celular", microwave: "micro-ondas", oven: "forno", toaster: "torradeira", sink: "pia",
  refrigerator: "geladeira", book: "livro", clock: "relógio", vase: "vaso", scissors: "tesoura", "teddy bear": "ursinho de pelúcia", "hair drier": "secador de cabelo",
  toothbrush: "escova de dente",
};

/** Name the dominant color of an RGB sample (Portuguese). */
export function colorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 510;
  const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
  if (l < 0.18) return "preto";
  if (l > 0.85 && s < 0.4) return "branco";
  if (s < 0.18) return "cinza";
  let h = 0;
  const d = max - min;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 15 || h >= 340) return l < 0.35 ? "marrom" : "vermelho";
  if (h < 40) return l < 0.4 ? "marrom" : "laranja";
  if (h < 68) return "amarelo";
  if (h < 165) return "verde";
  if (h < 260) return "azul";
  if (h < 300) return "roxo";
  return "rosa";
}

/** Average color of the central part of a box on a canvas. */
export function boxColor(ctx: CanvasRenderingContext2D, [x, y, w, h]: number[]): string {
  const cx = Math.round(x + w * 0.3), cy = Math.round(y + h * 0.3);
  const cw = Math.max(1, Math.round(w * 0.4)), ch = Math.max(1, Math.round(h * 0.4));
  const px = ctx.getImageData(cx, cy, cw, ch).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < px.length; i += 16) { r += px[i]; g += px[i + 1]; b += px[i + 2]; n++; }
  return colorName(r / n, g / n, b / n);
}
