// src_server/src/mapeditor/MapEditorServer.ts
import fs from "fs";
import path from "path";

// Dacă NU ai ragemp-types instalat, lasă "any" aici.
declare const mp: any;

type MapObj = {
  model: string;                          // ex: "prop_table_04"
  pos: { x: number; y: number; z: number };
  rot: { x: number; y: number; z: number }; // grade
  alpha?: number;                         // optional, default 255
  dimension?: number;                     // optional, default 0
};

const MAPS_DIR = path.join(__dirname, "maps"); // robust: langă fișierul compilat
fs.mkdirSync(MAPS_DIR, { recursive: true });

function safeName(s: string): string {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-\.]/g, "_");
}

function notify(player: any, msg: string) {
  // RAGE:MP color format: !{RRGGBB}, fara '#'
  player.outputChatBox(`!{ffc107}[Editor] ${msg}`);
}

// Acceptă si obiecte si array pentru compatibilitate
function normalizeEntry(o: any): MapObj | null {
  if (!o || typeof o !== "object") return null;

  const model = String(o.model || "").trim();
  if (!model) return null;

  // pos poate fi {x,y,z} sau [x,y,z]
  let pos = o.pos;
  if (Array.isArray(pos)) {
    pos = { x: Number(pos[0]), y: Number(pos[1]), z: Number(pos[2]) };
  }
  // rot poate fi {x,y,z} sau [x,y,z]
  let rot = o.rot;
  if (Array.isArray(rot)) {
    rot = { x: Number(rot[0]), y: Number(rot[1]), z: Number(rot[2]) };
  }

  if (!pos || !rot) return null;

  return {
    model,
    pos: { x: Number(pos.x), y: Number(pos.y), z: Number(pos.z) },
    rot: { x: Number(rot.x), y: Number(rot.y), z: Number(rot.z) },
    alpha: o.alpha != null ? Number(o.alpha) : undefined,
    dimension: o.dimension != null ? Number(o.dimension) : undefined
  };
}

mp.events.add("MapEditor_Save", (player: any, rawName: string, payload: string) => {
  try {
    const name = safeName(rawName);
    if (!name) return notify(player, "Invalid map name.");

    let arr: any = [];
    try {
      arr = JSON.parse(String(payload) || "[]");
      if (!Array.isArray(arr)) throw new Error("Payload is not an array");
    } catch {
      return notify(player, "Save error: invalid JSON payload.");
    }

    const normalized: MapObj[] = [];
    for (const it of arr) {
      const n = normalizeEntry(it);
      if (n) normalized.push(n);
    }

    const file = path.join(MAPS_DIR, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(normalized, null, 2), "utf8");
    notify(player, `Saved ${normalized.length} objects to ${name}.json`);
  } catch (e) {
    notify(player, `Save error: ${(e as Error).message}`);
  }
});

mp.events.add("MapEditor_Load", (player: any, rawName: string) => {
  const name = safeName(rawName);
  if (!name) return notify(player, "Invalid map name.");

  const file = path.join(MAPS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return notify(player, `Map "${name}" not found.`);

  const json = fs.readFileSync(file, "utf8");
  // Trimitem JSON către clientul care a cerut; clientul spawnează local.
  player.call("MapEditor_Loaded", [json]);
  notify(player, `Sent "${name}" to your client.`);
});

mp.events.add("MapEditor_Deload", (player: any, rawName: string) => {
  const name = safeName(rawName);
  if (!name) return notify(player, "Invalid map name.");
  // Clientul meu așteaptă confirmare nominală ca să-și curețe local.
  player.call("MapEditor_Deloaded", [name]);
  notify(player, `Deload signal for "${name}" sent to your client.`);
});

mp.events.add("MapEditor_Maps", (player: any) => {
  const files = fs.readdirSync(MAPS_DIR)
    .filter(f => f.toLowerCase().endsWith(".json"))
    .map(f => f.replace(/\.json$/i, ""));
  // Clientul meu ascultă "MapEditor_Maps_List"
  player.call("MapEditor_Maps_List", [JSON.stringify(files)]);
});
