import { useState, useEffect, useCallback } from "react";

// valuedf = schoolId, displaydf = city
const useIdArraysFilter = (dataSource, valueDataField, displayDataField, lookup) => {
    const [headerFilterDS, setHeaderFilterDS] = useState([]);

    useEffect(() => {
        setHeaderFilterDS(
            Object.entries(
                dataSource.map(record => lookup.get(record[valueDataField]))
                .filter(val => val)
                .reduce((accumulator, record) => {
                    if (!accumulator.hasOwnProperty(record[displayDataField])) {
                        accumulator[record[displayDataField]] = [];
                    }
                    accumulator[record[displayDataField]].push(record.id);
                    return accumulator;
                }, {})
            ).map(([display, ids]) => ({ text: display, value: () => ids }))
        );
    }, [dataSource, valueDataField, displayDataField, lookup]);

    const calculateFilterExpr = useCallback(filterValue => {
        if (filterValue) {
            const values = filterValue();
            if (values.length > 1) {
                const expr = [];
                for (const value of values) {
                    expr.push([valueDataField, '=', value])
                    expr.push('or')
                }
                expr.pop();
                return expr;
            } else {
                return [valueDataField, '=', values[0]];
            }
        } else {
            return null;
        }
    }, [valueDataField]);

    return [headerFilterDS, calculateFilterExpr];
};

export default useIdArraysFilter;