import { useState, useEffect, useCallback } from 'react';
import { uniques } from '../../utils/arrayUtils';
import uuid from 'react-uuid';

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './useselectboxtext.json';

export const useSelectBoxOptions = Object.freeze({
    EMPTY: uuid(),
    ALL: uuid()
});

/**
 * Select box logic for a value (string) from a datasource
 * @param {Array} dataSource The data from which the value is selected
 * @param {string} defaultValue The default selected value
 * @param {string | null} field The specific field of records from the datasource, from which values are selected.
 * If the field is null, the datasource is treated as an array of strings.
 */
const useSelectBox = (dataSource, field=null, defaultValue=null) => {

    // The selected value from the datasource
    const [selected, setSelected] = useState(defaultValue || useSelectBoxOptions.ALL);

    // DataSource for the selectBox
    const [selectionDS, setSelectionDS] = useState([]);
    useEffect(() => {
        setSelectionDS(
            [{ value: useSelectBoxOptions.ALL, text: pageText.all },
             { value: useSelectBoxOptions.EMPTY, text: pageText.empty }].concat(
                dataSource ?
                (field ? uniques(dataSource.map(record => record[field])) : dataSource)
                .filter(value => value)
                .sort((str1, str2) => (str1 && str2) ? str2.localeCompare(str1) : 0)
                .map(value => ({ value: value, text: value }))
                : []
            )
        );
    }, [dataSource, field]);

    // update the yearfiltervalues state when the year filter is changed through the tagbox
    const handleValueChanged = useCallback(event => {
        setSelected(event.value);
    }, []);

    // Props for the select box
    const [selectBoxProps, setSelectBoxProps] = useState({});
    useEffect(() => {
        setSelectBoxProps({
            dataSource: {
                store: selectionDS,
                paginate: true,
                pageSize: settingsConstants.selectBoxPageSize
            },
            value: selected,
            searchEnabled: true,
            onValueChanged: handleValueChanged,
            rtlEnabled: true,
            displayExpr: 'text',
            valueExpr: 'value',
            width: 300,
        });
    }, [selected, selectionDS, handleValueChanged]);

    return [selected, selectBoxProps];
};

export default useSelectBox;