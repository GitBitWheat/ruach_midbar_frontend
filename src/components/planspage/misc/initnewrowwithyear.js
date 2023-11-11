import { useSelectBoxOptions } from '../../../customhooks/useselectbox/useselectbox';

/** Creates an InitNewRow event handler, which adds the dataYear to every new row in the datagrid */
export const initNewRowWithYear = dataYear =>
    /** @param {import('devextreme/ui/data_grid').InitNewRowEvent} event */
    event => {
        if (!Object.values(useSelectBoxOptions).includes(dataYear)) {
            event.data.year = dataYear;
        }
    };