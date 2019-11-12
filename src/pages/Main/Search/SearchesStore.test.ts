import { resultToRows } from './SearchesStore';
import { actObject, objectTypes } from '../../../core/testHelper';
import { SortOrder } from '../../../components/ObjectTable';

const ascObjectType: SortOrder = { order: 'asc', orderBy: 'objectType' };

it('can make result to rows', () => {
  expect(
    resultToRows({
      simpleSearch: { id: 'a', status: 'pending', searchString: 'whatever', objectTypeFilter: [] },
      objectTypeFilter: new Set(),
      selectedObjectIds: new Set(),
      sortOrder: ascObjectType
    })
  ).toEqual([]);
  expect(
    resultToRows({
      simpleSearch: { id: 'a', status: 'pending', searchString: 'whatever', objects: [], objectTypeFilter: [] },
      objectTypeFilter: new Set(),
      selectedObjectIds: new Set(),
      sortOrder: ascObjectType
    })
  ).toEqual([]);

  const someThreatActor = actObject({ id: 'x', type: objectTypes.threatActor });
  const someReport = actObject({ id: 'y', type: objectTypes.report });

  expect(
    resultToRows({
      simpleSearch: {
        id: 'a',
        status: 'done',
        searchString: 'whatever',
        objects: [someThreatActor, someReport],
        objectTypeFilter: []
      },
      selectedObjectIds: new Set([someReport.id]),
      objectTypeFilter: new Set(),
      sortOrder: ascObjectType
    })
  ).toEqual([
    { actObject: someReport, isSelected: true, label: '' },
    { actObject: someThreatActor, isSelected: false, label: '' }
  ]);
});

it('can filter rows by object type', () => {
  const someThreatActor = actObject({ id: 'x', type: objectTypes.threatActor });
  const someReport = actObject({ id: 'y', type: objectTypes.report });

  expect(
    resultToRows({
      simpleSearch: {
        id: 'a',
        status: 'done',
        searchString: 'whatever',
        objects: [someThreatActor, someReport],
        objectTypeFilter: []
      },
      selectedObjectIds: new Set(),
      objectTypeFilter: new Set([objectTypes.threatActor.name]),
      sortOrder: ascObjectType
    })
  ).toEqual([{ actObject: someThreatActor, isSelected: false, label: '' }]);
});