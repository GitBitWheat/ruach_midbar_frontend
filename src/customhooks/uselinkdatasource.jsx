import { useState, useEffect, useCallback } from "react";
import { uniques } from "../utils/arrayUtils";

const linkToText = link => link ? (link.split('#')[0] || '(Blanks)') : '(Blanks)';

const textsValues = (ds, field) =>
    uniques(ds.map(dsObj => linkToText(dsObj[field])))
    .map(val => ({ text: linkToText(val), value: [field, 'startswith', val] }))
    .sort((filterExp1, filterExp2) => filterExp1.text.localeCompare(filterExp2.text));

const fieldCounts = arr =>
    arr.reduce(
        (prev, curr) => ({
            ...prev,
            [curr]: 1 + (prev[curr] || 0),
        }), {}
    );

const useLinkDataSource = (dataSource, linkField) => {

    const [linkDS, setLinkDS] = useState([]);
    const [occCntr, setOccCntr] = useState({});

    useEffect(() => {
        setLinkDS(textsValues(dataSource, linkField));
        setOccCntr(fieldCounts(dataSource.map(dsObj => linkToText(dsObj[linkField]))));
    }, [dataSource, linkField]);

    const add = useCallback(obj => {
        const val = linkToText(obj[linkField]);

        if (val in occCntr) {
            setOccCntr({ ...occCntr, [val]: occCntr[val] + 1 });
        } else {
            setOccCntr({ ...occCntr, [val]: 1 });
            setLinkDS([...linkDS].concat({ text: val, value: [linkField, 'startswith', val] }));
        }
    }, [linkField, linkDS, occCntr]);

    const update = useCallback((oldObj, newObj) => {
        const oldVal = linkToText(oldObj[linkField]);
        const newVal = linkToText(newObj[linkField]);

        const newOccCntr = { ...occCntr };
        let newLinkDs = null;
        newOccCntr[oldVal] -= 1;
        newOccCntr[newVal] = (newOccCntr[newVal] || 0) + 1;

        if (newOccCntr[oldVal] === 0) {
            delete newOccCntr[oldVal];
            newLinkDs = linkDS.filter(dsObj => dsObj.value[2] !== oldVal);
        }
        if (newOccCntr[newVal] === 1) {
            newLinkDs = (newLinkDs || linkDS)
                .concat({ text: linkToText(newVal), value: [linkField, 'startswith', newVal] });
        }

        setOccCntr(newOccCntr);
        if (newLinkDs) {
            setLinkDS(newLinkDs);
        }
    }, [linkField, linkDS, occCntr]);

    const remove = useCallback(obj => {
        const val = linkToText(obj[linkField]);

        if (occCntr[val] > 1) {
            setOccCntr({ ...occCntr, [val]: occCntr[val] - 1 });
        } else {
            const newOccCntr = { ...occCntr };
            delete newOccCntr[val];
            setOccCntr(newOccCntr);
            setLinkDS(linkDS.filter(dsObj => dsObj.value[2] !== val));
        }
    }, [linkField, linkDS, occCntr]);

    return {
        dataSource: linkDS,
        add: add,
        update: update,
        remove: remove
    };
};

export default useLinkDataSource;