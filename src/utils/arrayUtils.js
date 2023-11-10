import { caseInsensitiveCompare } from "./stringutils";

export function pushSetter(array, setter) {
    return newValue => {
        const arrayCopy = [...array];
        arrayCopy.push(newValue);
        setter(arrayCopy);
    }
}

// Sorts an array of either strings or integers. null values are allowed
export function generalCaseInsensitiveSort(valueExtracter) {
    return (elem1, elem2) => {
        const val1 = valueExtracter(elem1);
        const val2 = valueExtracter(elem2);

        if (val1 && val2 && typeof(val1) === 'string' && typeof(val2) === 'string') {
            return caseInsensitiveCompare(val1, val2);
        } else if (val1 && val2 && typeof(val1) === 'number' && typeof(val2) === 'number') {
            return val1 < val2 ? -1 : 1;
        } else if ((val1 && val2) || (!val1 && !val2)) {
            return 0;
        } else if(!val1) {
            return 1;
        }
        // If val1 !== null && val2 === null
        else {
            return -1;
        }
    };
}

// Same array without duplicate values
export function uniques(array) {
    return [...new Set(array)];
}

export function sum(array) {
    return array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

export function* range(start, stop, step = 1) {
    if (!stop) {
        // one param defined
        stop = start;
        start = 0;
    }

    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        yield i;
    }
}

/**
 * Symmetric difference between two arrays.
 * @param {Array} arr1 
 * @param {Array} arr2 
 * @return {Array}
 */
export const symmDiff = (arr1, arr2) =>
    arr1.filter(val => !arr2.includes(val))
    .concat(arr2.filter(val => !arr1.includes(val)));