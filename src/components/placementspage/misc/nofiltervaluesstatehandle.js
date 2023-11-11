// State storing of the data grids - don't save filter values,
// or sorting state, other than ascending sorting on dists column by default
export const noFilterValuesStateHandle = storageKey => [
    state => {
        state.columns
        .forEach(col => {
            delete col.filterValues;
            if (col.name === 'dist') {
                col.sortIndex = 0;
                col.sortOrder = 'asc';
            } else {
                delete col.sortIndex;
                delete col.sortOrder;
            }
        });
        localStorage.setItem(storageKey, JSON.stringify(state));
    }, () => {
        return JSON.parse(localStorage.getItem(storageKey));
    }
];