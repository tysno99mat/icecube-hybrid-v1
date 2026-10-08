// @ts-check
// This is the sole product entry point to the frozen scientific module.
import {simulateEvent, validateEventInput, sampleEventInput, VERSION, CONTRACT, FIT_TIERS, FIT_GATES, DISCLAIMERS, strings, doms} from '../core.mjs';
/** @typedef {import('./types').EventInput} EventInput */
/** @typedef {import('./types').Controls} Controls */
export const CORE_SHA = 'b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9';
// Copies are frozen; the scientific module's mutable exported references never leave this boundary.
const readonly = value => {
  if (value && typeof value === 'object') { for (const v of Object.values(value)) readonly(v); Object.freeze(value); }
  return value;
};
export const metadata = readonly(structuredClone({VERSION, CONTRACT, FIT_TIERS, FIT_GATES, DISCLAIMERS}));
export const geometry = readonly(structuredClone({strings, doms}));
let calls = 0;
export const getSimulationCount = () => calls;
/** Controlled UI sampling is checked before calling the core sampler. @param {Controls} c */
export function controlledInput(c) {
  if (!CONTRACT.types.includes(c.type) || !['up','down','any'].includes(c.directionMode)
      || typeof c.energy !== 'number' || !Number.isFinite(c.energy) || c.energy < CONTRACT.energyTeV[0] || c.energy > CONTRACT.energyTeV[1]
      || typeof c.seed !== 'number' || !Number.isInteger(c.seed) || c.seed < 0 || c.seed > 4294967295) {
    return null;
  }
  return sampleEventInput(c.type, c.energy, c.directionMode, c.seed);
}
/** Every public input, including invalid values, goes through the frozen path. No options argument. @param {unknown} input */
export function createEvent(input) {
  calls++;
  const result = simulateEvent(input);
  if (result.status !== 'OK') return readonly({status: result.status, errors: [...result.errors]});
  // Keep the exact caller input as provenance. The returned validated input may normalize direction.
  const exactInput = structuredClone(input);
  const times = result.hits.map(h => h.t);
  const tMin = Math.min(0, ...times), tMax = Math.max(3000, ...times);
  // No scientific values are altered. Map is not exposed (Object.freeze does not make Maps immutable).
  const hitLookup = new Map(result.hits.map(h => [h.dom, h]));
  readonly(exactInput);
  readonly(result.input); readonly(result.event); readonly(result.ledger);
  readonly(result.hits); readonly(result.clean); readonly(result.reco); readonly(result.qa);
  const summary = readonly({seed: result.input.seed, type: result.input.type, energy: result.input.energy,
    hitCount: result.hits.length, cleanHitCount: result.clean.length, tMin, tMax,
    fitRenderable: result.input.type !== 'cascade' && result.reco.fitStatus === 'FIT_RENDERABLE' && !!result.reco.fitDirection,
    directionStatus: result.reco.directionStatus,
    state: !result.hits.length ? 'NO_HITS' : result.clean.length < 4 ? 'SPARSE_EVENT' : 'OK'});
  return Object.freeze({status:'OK', exactInput, result, summary, hitAt: idx => hitLookup.get(idx) || null});
}
export const validateInput = input => validateEventInput(input);
export function inspectDOM(session, idx) {
  const d = geometry.doms[idx];
  if (!d || session.status !== 'OK') return null;
  return {sensor:d, hit:session.hitAt(idx)};
}
export function eventRecord(session) {
  if (session.status !== 'OK') return session;
  // Map is serialized without losing its entries; the untouched returned result is retained in memory.
  return {coreSHA:CORE_SHA, exactEventInput:session.exactInput, authoritativeResult:{...session.result, byDom:[...session.result.byDom]}};
}
