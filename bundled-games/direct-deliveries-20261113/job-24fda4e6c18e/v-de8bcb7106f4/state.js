// Shared campaign state (module split: state.js).
// Containers are const and mutated in place, never reassigned.
// P (the active human house) is an exported live binding; change it only through setP().
// Character/unit id counters live in ID (ID.c, ID.u).
export const S = { seen: new Set(), visited: new Set(), turn: 1, year: 3001, apoc: 15, prisoners: [], wards: [], slaves: 0, war: new Set(), ally: new Set(), loans: [], recl: null, nmSupport: {}, nmYear: 0, nmGive: {}, standing: {}, council: [], sanct: [], bank: { gov: 'Republic', dict: 0, peace: 0 } };
export const F = [];      // factions
export const CH = {};     // characters by id
export const systems = []; // worlds
export const units = [];   // fleets and agents
export const ID = { c: 0, u: 0 };
export let P = -1;
export function setP(v) { P = v; return v; }
