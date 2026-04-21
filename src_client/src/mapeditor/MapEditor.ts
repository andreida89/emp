/* eslint-disable @typescript-eslint/no-explicit-any */
declare const mp: any;

import Natives from "./Natives";
import objectDataJson from "./object_data";

/**
 * MapEditor.ts — client-side (RAGE:MP JS/TS)
 * - Toggle cu F2
 * - Preview dinamic in fata jucatorului
 * - Plasare, rotire, inaltime, distanta
 * - /mhelp /mnext /mprev /mobj /mclear /msave /mload /mdeload /mmaps
 * - Evenimente remote compatibile cu MapEditorServer.ts
 *
 * Notite anti-obfuscator:
 *  - folosim hashModel() cu fallback joaatLocal ca sa evitam mp.joaat mangled
 */

// -------------------------------
// Fallback JOAAT (in caz ca mp.joaat e rupt de bundler/obfuscator)
// -------------------------------
function joaatLocal(key: string): number {
  key = (key || "").toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i);
    hash += (hash << 10);
    hash ^= (hash >>> 6);
  }
  hash += (hash << 3);
  hash ^= (hash >>> 11);
  hash += (hash << 15);
  return (hash >>> 0) | 0; // int32
}

function hashModel(name: string): number {
  const j = (mp && typeof mp.joaat === "function") ? mp.joaat : joaatLocal;
  return j(name);
}

// -------------------------------
// Config
// -------------------------------
const TOGGLE_KEY = 0x71; // F2
const ROT_LEFT_KEY = 0x51; // Q
const ROT_RIGHT_KEY = 0x45; // E
const HEIGHT_UP_KEY = 0x21; // PageUp
const HEIGHT_DOWN_KEY = 0x22; // PageDown
const DIST_FWD_KEY = 0x26; // ArrowUp
const DIST_BACK_KEY = 0x28; // ArrowDown
const CONFIRM_KEY = 0x0d; // Enter
const DELETE_LAST_KEY = 0x08; // Backspace
const CANCEL_PREVIEW_KEY = 0x58; // X

const DIST_STEP = 0.2;
const HEIGHT_STEP = 0.05;
const ROT_STEP = 5.0; // grade
const BASE_DISTANCE = 1.6;

// -------------------------------
// Tipuri
// -------------------------------
type PlacedObj = {
  handle: number;
  modelName: string;
  modelHash: number;
};

type SavedObj = {
  model: string;
  pos: { x: number; y: number; z: number };
  rot: { x: number; y: number; z: number };
  alpha?: number;
  dimension?: number;
};

// -------------------------------
/** Lista de obiecte vanilla (din object_data.ts, string JSON cu { Objects: string[] }) */
const objData: string[] = JSON.parse(objectDataJson).Objects || [];

// -------------------------------
// Stare editor
// -------------------------------
let editorActive = false;
let selectedIndex = 0;
let selectedModelName = objData[0] || "prop_table_03";

let previewHandle: number | null = null;
let distanceOffset = BASE_DISTANCE;
let heightOffset = 0;
let yawOffset = 0;

const placed: PlacedObj[] = [];
const loadedMaps: Record<string, number[]> = Object.create(null); // name -> handle[]

// -------------------------------
// Helpers vizuale/utilitare
// -------------------------------
function deg2rad(d: number) { return d * Math.PI / 180; }

function getForwardVector(headingDeg: number) {
  const h = deg2rad(headingDeg);
  return { x: -Math.sin(h), y: Math.cos(h) };
}

function text(x: number, y: number, s: string, scale = 0.35, r = 255, g = 255, b = 255, a = 210) {
  mp.game.graphics.drawText(s, [x, y], {
    font: 4,
    color: [r, g, b, a],
    scale: [scale, scale],
    outline: true
  });
}

// In JS pe RAGE:MP NU exista mp.game.wait. Polling asincron pentru modele.
function requestModelAsync(hash: number, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!mp.game.streaming.isModelInCdimage(hash)) return resolve(false);

    mp.game.streaming.requestModel(hash);

    const start = Date.now();
    const iv = setInterval(() => {
      if (mp.game.streaming.hasModelLoaded(hash)) {
        clearInterval(iv);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        resolve(false);
      }
    }, 50);
  });
}

function releaseModel(hash: number) {
  try { mp.game.streaming.setModelAsNoLongerNeeded(hash); } catch {}
}

// Foloseste deleteObject, nu deleteEntity
function deleteHandleSafe(handle: number) {
  try { mp.game.entity.setEntityAsMissionEntity(handle, true, true); } catch {}
  try {
    mp.game.object.deleteObject(handle);
  } catch {
    // fallback: arunca-l sub mapa
    try { mp.game.entity.setEntityCoordsNoOffset(handle, 0, 0, -100, true, true, true); } catch {}
  }
}

function getObjTransform(handle: number) {
  const pos = mp.game.entity.getEntityCoords(handle, true);
  const rot = mp.game.entity.getEntityRotation(handle, 2);
  return {
    pos: { x: pos.x, y: pos.y, z: pos.z },
    rot: { x: rot.x, y: rot.y, z: rot.z }
  };
}

function setObjTransform(handle: number, pos: {x:number;y:number;z:number}, yawDeg: number) {
  mp.game.entity.setEntityCoordsNoOffset(handle, pos.x, pos.y, pos.z, true, true, true);
  // rot: pitch, roll, yaw
  mp.game.entity.setEntityRotation(handle, 0, 0, yawDeg, 2, true);
}

function computePreviewPosition(): { x: number; y: number; z: number; yaw: number } {
  const me = mp.players.local;
  const base = me.position;
  const head = me.getHeading();
  const forward = getForwardVector(head);
  const x = base.x + forward.x * distanceOffset;
  const y = base.y + forward.y * distanceOffset;
  const z = base.z + heightOffset;
  const yaw = head + yawOffset;
  return { x, y, z, yaw };
}

function updatePreview() {
  if (previewHandle == null) return;
  const p = computePreviewPosition();
  setObjTransform(previewHandle, { x: p.x, y: p.y, z: p.z }, p.yaw);
}

async function spawnPreview() {
  const hash = hashModel(selectedModelName);

  if (!mp.game.streaming.isModelInCdimage(hash)) {
    mp.gui.chat.push(`!{FF5555}[MapEditor] Model inexistent: ${selectedModelName}`);
    return;
  }

  const ok = await requestModelAsync(hash, 4000);
  if (!ok) {
    mp.gui.chat.push(`!{FFAA55}[MapEditor] Timeout la incarcarea modelului: ${selectedModelName}`);
    return;
  }

  if (!editorActive) { releaseModel(hash); return; }

  const p = computePreviewPosition();
  const handle = mp.game.object.createObject(hash, p.x, p.y, p.z, false, false, false);
  mp.game.entity.freezeEntityPosition(handle, true);
  setObjTransform(handle, { x: p.x, y: p.y, z: p.z }, p.yaw);
  previewHandle = handle;

  releaseModel(hash);
}

function destroyPreview() {
  if (previewHandle != null) {
    deleteHandleSafe(previewHandle);
    previewHandle = null;
  }
}

function confirmPlacement() {
  if (previewHandle == null) return;
  mp.game.entity.freezeEntityPosition(previewHandle, false);
  const modelName = selectedModelName;
  const modelHash = hashModel(modelName);
  placed.push({ handle: previewHandle, modelName, modelHash });

  previewHandle = null;
  spawnPreview(); // no-await
}

function deleteLastPlaced() {
  const last = placed.pop();
  if (!last) return;
  deleteHandleSafe(last.handle);
}

function clearPlacedLocal() {
  while (placed.length) {
    const o = placed.pop()!;
    deleteHandleSafe(o.handle);
  }
}

function selectIndex(newIndex: number) {
  if (objData.length === 0) return;
  selectedIndex = ((newIndex % objData.length) + objData.length) % objData.length;
  selectedModelName = objData[selectedIndex];
  destroyPreview();
  spawnPreview();
}

function selectBySearch(partial: string) {
  const idx = objData.findIndex(n => n.toLowerCase().includes(partial.toLowerCase()));
  if (idx >= 0) {
    selectIndex(idx);
    mp.gui.chat.push(`!{55FF55}[MapEditor] Selected: ${selectedModelName} (#${idx + 1}/${objData.length})`);
  } else {
    mp.gui.chat.push(`!{FFAA55}[MapEditor] N-am gasit nimic pentru: ${partial}`);
  }
}

function buildSaveJson(): string {
  const arr: SavedObj[] = placed.map(p => {
    const t = getObjTransform(p.handle);
    return { model: p.modelName, pos: t.pos, rot: t.rot };
  });
  return JSON.stringify(arr);
}

function loadMapFromJson(json: string, intoName?: string) {
  let arr: SavedObj[] = [];
  try {
    arr = JSON.parse(json);
    if (!Array.isArray(arr)) throw new Error("not array");
  } catch {
    mp.gui.chat.push("!{FF5555}[MapEditor] JSON invalid.");
    return;
  }

  const handles: number[] = [];
  for (const o of arr) {
    const hash = hashModel(o.model);
    requestModelAsync(hash, 2000).then(() => {
      const h = mp.game.object.createObject(hash, o.pos.x, o.pos.y, o.pos.z, false, false, false);
      mp.game.entity.freezeEntityPosition(h, false);
      setObjTransform(h, o.pos, o.rot.z || 0);
      handles.push(h);
      releaseModel(hash);
    });
  }

  if (intoName) {
    if (loadedMaps[intoName]) {
      for (const h of loadedMaps[intoName]) deleteHandleSafe(h);
    }
    loadedMaps[intoName] = handles;
  }
}

// -------------------------------
// Toggle editor
// -------------------------------
function setEditorActive(active: boolean) {
  if (editorActive === active) return;
  editorActive = active;

  try { mp.gui.cursor.show(active, active); } catch {}
  try { mp.game.ui.displayRadar(!active); } catch {}
  try { mp.game.ui.displayHud(!active); } catch {}

  if (active) {
    distanceOffset = BASE_DISTANCE;
    heightOffset = 0;
    yawOffset = 0;
    spawnPreview();
    mp.gui.chat.push("!{00D1FF}[MapEditor] ON  — Comenzi: mhelp");
  } else {
    destroyPreview();
    mp.gui.chat.push("!{FF8888}[MapEditor] OFF");
  }
}

// -------------------------------
// Keybinds
// -------------------------------
mp.keys.bind(TOGGLE_KEY, true, () => setEditorActive(!editorActive));

mp.keys.bind(ROT_LEFT_KEY, true, () => {
  if (!editorActive || previewHandle == null) return;
  yawOffset -= ROT_STEP;
  updatePreview();
});

mp.keys.bind(ROT_RIGHT_KEY, true, () => {
  if (!editorActive || previewHandle == null) return;
  yawOffset += ROT_STEP;
  updatePreview();
});

mp.keys.bind(HEIGHT_UP_KEY, true, () => {
  if (!editorActive || previewHandle == null) return;
  heightOffset += HEIGHT_STEP;
  updatePreview();
});

mp.keys.bind(HEIGHT_DOWN_KEY, true, () => {
  if (!editorActive || previewHandle == null) return;
  heightOffset -= HEIGHT_STEP;
  updatePreview();
});

mp.keys.bind(DIST_FWD_KEY, true, () => {
  if (!editorActive || previewHandle == null) return;
  distanceOffset += DIST_STEP;
  updatePreview();
});

mp.keys.bind(DIST_BACK_KEY, true, () => {
  if (!editorActive || previewHandle == null) return;
  distanceOffset = Math.max(0.2, distanceOffset - DIST_STEP);
  updatePreview();
});

mp.keys.bind(CONFIRM_KEY, true, () => {
  if (!editorActive || previewHandle == null) return;
  confirmPlacement();
});

mp.keys.bind(DELETE_LAST_KEY, true, () => {
  if (!editorActive) return;
  deleteLastPlaced();
});

mp.keys.bind(CANCEL_PREVIEW_KEY, true, () => {
  if (!editorActive) return;
  destroyPreview();
  spawnPreview();
});

// -------------------------------
// Render overlay
// -------------------------------
mp.events.add("render", () => {
  if (!editorActive) return;

  text(0.50, 0.06, "MAP EDITOR", 0.5, 0, 209, 255);
  text(0.50, 0.095, `Model: ${selectedModelName}  (${selectedIndex + 1}/${objData.length})`, 0.35);
  text(0.50, 0.125, `Dist: ${distanceOffset.toFixed(2)}  Height: ${heightOffset.toFixed(2)}  Yaw: ${yawOffset.toFixed(1)}`, 0.33, 200, 200, 200);

  text(0.015, 0.82, "[Q/E] Rotire   [PgUp/PgDn] Inaltime   [↑/↓] Distanta", 0.32, 220, 220, 220);
  text(0.015, 0.85, "[Enter] Plaseaza   [Backspace] Sterge ultimul   [X] Reset preview", 0.32, 220, 220, 220);
  text(0.015, 0.88, "[/mhelp] Ajutor comenzi   [/mmaps] Listeaza harti", 0.32, 220, 220, 220);
});

// -------------------------------
// Comenzi chat (doar cand editorul e ON)
// -------------------------------
function showHelp() {
  const lines = [
    "!{00D1FF}MapEditor comenzi (doar cand e ON):",
    "!{CCCCCC}/mhelp !{888888}- arata acest ajutor",
    "!{CCCCCC}/mnext !{888888}- urmatorul model",
    "!{CCCCCC}/mprev !{888888}- modelul anterior",
    "!{CCCCCC}/mobj <parteNume> !{888888}- cauta si selecteaza model",
    "!{CCCCCC}/mclear !{888888}- sterge toate obiectele plasate local",
    "!{CCCCCC}/msave <nume> !{888888}- salveaza local pe server",
    "!{CCCCCC}/mload <nume> !{888888}- incarca map (doar la tine)",
    "!{CCCCCC}/mdeload <nume> !{888888}- scoate map din clientul tau",
    "!{CCCCCC}/mmaps !{888888}- listeaza hartile existente pe server"
  ];
  for (const l of lines) mp.gui.chat.push(l);
}

mp.events.add("playerCommand", (full: string) => {
  if (!editorActive) return;

  const [cmd, ...rest] = full.trim().split(/\s+/);
  const arg = rest.join(" ").trim();

  switch (cmd.toLowerCase()) {
    case "mhelp":
      showHelp();
      break;
    case "mnext":
      selectIndex(selectedIndex + 1);
      break;
    case "mprev":
      selectIndex(selectedIndex - 1);
      break;
    case "mobj":
    case "mfind":
      if (!arg) mp.gui.chat.push("!{FFAA55}Folosire: /mobj <parteNume>");
      else selectBySearch(arg);
      break;
    case "mclear":
      clearPlacedLocal();
      mp.gui.chat.push("!{FF8888}[MapEditor] Plasarile locale au fost sterse.");
      break;
    case "msave":
      if (!arg) { mp.gui.chat.push("!{FFAA55}Folosire: /msave <nume>"); break; }
      if (!placed.length) { mp.gui.chat.push("!{FFAA55}[MapEditor] N-ai nimic de salvat."); break; }
      {
        const body = buildSaveJson();
        mp.events.callRemote("MapEditor_Save", arg, body);
      }
      break;
    case "mload":
      if (!arg) { mp.gui.chat.push("!{FFAA55}Folosire: /mload <nume>"); break; }
      mp.events.callRemote("MapEditor_Load", arg);
      break;
    case "mdeload":
      if (!arg) { mp.gui.chat.push("!{FFAA55}Folosire: /mdeload <nume>"); break; }
      if (loadedMaps[arg]) {
        for (const h of loadedMaps[arg]) deleteHandleSafe(h);
        delete loadedMaps[arg];
      }
      mp.events.callRemote("MapEditor_Deload", arg);
      break;
    case "mmaps":
      mp.events.callRemote("MapEditor_Maps");
      break;
    default:
      // lasa alte comenzi sa treaca
      break;
  }
});

// -------------------------------
// Remote events de la server
// -------------------------------
mp.events.add("MapEditor_Loaded", (json: string) => {
  loadMapFromJson(json);
  mp.gui.chat.push("!{55FFAA}[MapEditor] Map incarcat in client.");
});

mp.events.add("MapEditor_Deloaded", (name: string) => {
  if (loadedMaps[name]) {
    for (const h of loadedMaps[name]) deleteHandleSafe(h);
    delete loadedMaps[name];
  }
  mp.gui.chat.push(`!{FF8888}[MapEditor] Deload '${name}'.`);
});

mp.events.add("MapEditor_Maps_List", (jsonList: string) => {
  try {
    const arr: string[] = JSON.parse(jsonList);
    if (!arr.length) {
      mp.gui.chat.push("!{AAAAAA}[MapEditor] Nu exista harti salvate.");
      return;
    }
    mp.gui.chat.push("!{00D1FF}[MapEditor] HARTI EXISTENTE:");
    mp.gui.chat.push("!{CCCCCC}" + arr.join(", "));
  } catch {
    mp.gui.chat.push("!{FF5555}[MapEditor] Lista de harti e corupta.");
  }
});

// -------------------------------
// Start curat
// -------------------------------
setEditorActive(false);
