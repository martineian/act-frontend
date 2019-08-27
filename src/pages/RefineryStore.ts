import MainPageStore from './MainPageStore';
import { action, computed, observable, reaction } from 'mobx';
import { factMapToObjectMap, factsToObjects } from '../core/transformers';
import { relativeStringToDate } from '../components/RelativeDateSelector';
import { isBefore } from 'date-fns';
import config from '../config';
import * as _ from 'lodash/fp';

import { objectFactsToElements } from '../core/cytoscapeTransformers';
import { ActFact, ActObject, QueryResult } from './types';
import { isRetracted, isRetraction } from '../core/domain';
import * as d3 from 'd3';

export type ObjectTypeFilter = {
  id: string;
  name: string;
  checked: boolean;
};

export const filterByTime = (facts: { [id: string]: ActFact }, endTimestamp: Date | string) => {
  if (endTimestamp !== 'Any time') {
    const factEndTimeDate = relativeStringToDate(endTimestamp);
    return _.pickBy((fact: ActFact) => isBefore(new Date(fact.timestamp), factEndTimeDate))(facts);
  }
  return facts;
};

export const filterByObjectTypes = (facts: { [id: string]: ActFact }, objectTypeFilters: Array<ObjectTypeFilter>) => {
  const excludedObjectTypeIds = Object.values(objectTypeFilters)
    .filter(({ checked }) => !checked)
    .map(({ id }) => id);

  return _.pickBy((fact: ActFact) => {
    return factsToObjects([fact]).every((object: ActObject) => !excludedObjectTypeIds.includes(object.type.id));
  })(facts);
};

export const handleRetractions = (facts: { [id: string]: ActFact }, showRetractions: boolean) => {
  return showRetractions ? facts : _.omitBy((f: ActFact) => isRetraction(f) || isRetracted(f))(facts);
};

export const refineResult = (
  queryResult: QueryResult,
  objectTypeFilters: Array<ObjectTypeFilter>,
  endTimestamp: Date | string,
  showRetractions: boolean
): QueryResult => {
  const filteredFacts = _.pipe(
    facts => handleRetractions(facts, showRetractions),
    facts => filterByObjectTypes(facts, objectTypeFilters),
    facts => filterByTime(facts, endTimestamp)
  )(queryResult.facts);

  let filteredObjects = factMapToObjectMap(filteredFacts);

  return { facts: filteredFacts, objects: filteredObjects };
};

class RefineryStore {
  root: MainPageStore;

  @observable objectTypeFilters: Array<ObjectTypeFilter> = [];
  @observable endTimestamp: Date | string = 'Any time';

  constructor(root: MainPageStore) {
    this.root = root;

    reaction(
      () => this.root.queryHistory.result.objects,
      resultObjects => {
        if (Object.values(resultObjects).length === 0) {
          this.objectTypeFilters = [];
          return;
        }

        const uniqueObjectTypes = _.uniqBy((x: ActObject) => x.type.id)(Object.values(resultObjects));

        uniqueObjectTypes
          // Only add new ones
          .filter(x => !this.objectTypeFilters.some(y => x.type.id === y.id))
          .map(x => x.type)
          .forEach(x => {
            // @ts-ignore
            this.objectTypeFilters.push({ ...x, checked: true });
          });
      }
    );
  }
  @computed get refined(): QueryResult {
    return refineResult(
      this.root.queryHistory.result,
      this.objectTypeFilters,
      this.endTimestamp,
      this.root.ui.refineryOptionsStore.graphOptions.showRetractions
    );
  }

  @computed get cytoscapeElements() {
    const res: QueryResult = this.refined;

    return objectFactsToElements({
      facts: Object.values(res.facts),
      objects: Object.values(res.objects),
      objectLabelFromFactType: config.objectLabelFromFactType
    });
  }

  @action
  setEndTimestamp(newEnd: Date) {
    this.endTimestamp = newEnd;
  }

  @action
  toggleObjectTypeFilter(x: ObjectTypeFilter) {
    x.checked = !x.checked;
  }

  @computed
  get timeRange(): [Date, Date] {
    const res: QueryResult = this.refined;

    const facts = Object.values(res.facts);

    if (facts.length === 0) {
      const now = new Date();
      return [d3.timeMonth.floor(now), d3.timeMonth.ceil(now)];
    }

    // @ts-ignore
    const earliest = new Date(_.minBy(x => x.timestamp)(facts).timestamp);
    // @ts-ignore
    const latest = new Date(_.maxBy(x => x.timestamp)(facts).timestamp);
    return [earliest, latest];
  }
}

export default RefineryStore;
