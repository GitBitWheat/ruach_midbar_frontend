// Sorting method of the dist column. Null values are treated as infinity.
export const distColSortingMethod = (val1, val2) => {
    if (val1 === val2) {
        return 0;
    }
    if (!(!!val1)) {
        return 1;
    }
    if (!(!!val2)) {
        return -1;
    }
    return val1 > val2 ? 1 : -1;
};