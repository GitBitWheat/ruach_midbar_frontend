import { caseInsensitiveCompare } from "./stringutils";



function pushSetter(array, setter) {
    return newValue => {
        const arrayCopy = [...array];
        arrayCopy.push(newValue);
        setter(arrayCopy);
    }
}



// Sorts an array of either strings or integers. null values are allowed
function generalCaseInsensitiveSort(valueExtracter) {
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
function uniques(array) {
    return [...new Set(array)];
}

function sum(array) {
    return array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

function* range(start, stop, step = 1) {
    if (!stop) {
        // one param defined
        stop = start;
        start = 0;
    }

    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        yield i;
    }
}

export { pushSetter, generalCaseInsensitiveSort, uniques, sum, range };