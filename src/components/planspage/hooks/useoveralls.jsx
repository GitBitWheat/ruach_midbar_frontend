import { useState, useEffect } from 'react';
import { sum } from '../../../utils/arrayUtils';

const useOveralls = yearFilteredPlansDS => {
    // The overall overalls calculated over all plans of matching year and filters
    const [overallOverallsByFilters, setOverallOverallsByFilters] = useState(0);

    // Calculate the overall overalls by filters value
    const handleContentReady =
        /** @param {import('devextreme/ui/data_grid').ContentReadyEvent} event */
        event => {
            const combinedFilter = event.component.getCombinedFilter();
            event.component.getDataSource().store().load({ filter: combinedFilter }).then(filteredRows => {
                setOverallOverallsByFilters(sum(filteredRows.map(row => row.overall ? parseInt(row.overall) : 0)));
            });
        };

    // The overall overalls calculated over all plans of matching year
    const [overallOverallsByYear, setOverallOverallsByYear] = useState(0);
    useEffect(() => {
        setOverallOverallsByYear(sum(yearFilteredPlansDS.map(plan => plan.overall ? parseInt(plan.overall) : 0)));
    }, [yearFilteredPlansDS]);

    return [overallOverallsByFilters, overallOverallsByYear, handleContentReady];
};

export default useOveralls;