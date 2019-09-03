import { ActFact } from '../pages/types';

export function isRetracted(fact: ActFact) {
  return fact.flags.some(x => x === 'Retracted');
}

export function isRetraction(fact: ActFact) {
  return fact.type.name === 'Retraction';
}

export function isMetaFact(fact: ActFact) {
  return !fact.destinationObject && !fact.sourceObject && fact.inReferenceTo;
}