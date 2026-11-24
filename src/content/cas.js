// CAS PRATIQUES — un cas du cours (MarketOne / TempoRun) et quatre cas d'entraînement inventés pour la plateforme.
// Format d'un cas : { id, title, badge, level, context, seances, pitch, intro, commun: [{ id, title, html }], consignes,
//   camps: [{ id, name, label, color, mission, annexe, simulated?, source? }],
//   steps: [{ id, camp (null = tous), title, seances, q, keys, model, pitfalls }], debrief: { campId: html }, synthese }
import { MARKETONE } from './cas-marketone.js';
import { AO } from './cas-ao.js';
import { REFERENCEMENT } from './cas-referencement.js';
import { AGENT } from './cas-agent.js';
import { COMITE } from './cas-comite.js';

export const CAS = [MARKETONE, REFERENCEMENT, AO, AGENT, COMITE];
