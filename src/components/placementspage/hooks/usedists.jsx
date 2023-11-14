import { useState, useEffect, useCallback } from "react";
import { getDistanceRequest } from "../../../utils/localServerRequests";
import { symmDiff } from "../../../utils/arrayUtils";

/**
 * Update DataGrid filters according to the button filters controls
 * @param {import("react").RefObject} dgRef 
 * @param {Object} btnFltrs 
 * @param {String} dataField 
 */
export const updateDGFltrs = (dgRef, btnFltrs, dataField) => {
    if (dgRef && dgRef.current) {
        /** @type {DataGrid} */
        const dg = dgRef.current;
    
        // If the filterValues already match the button filters - do not update them.
        // It is possible the filterValues were updated via the datagrid menu, and as
        // a result this function called was by a useEffect. Prevent an infinite loop.
        const gridFltrExprs = dg.instance.columnOption(dataField, 'filterValues') || [];
        const gridEnabledFltrs =
            (gridFltrExprs.length && !Array.isArray(gridFltrExprs)) ?
            gridFltrExprs[2] : gridFltrExprs.map(fltrExpr => fltrExpr[2]);
        const fltrsCp = {...btnFltrs};
        for (const fltr of gridEnabledFltrs) {
            delete fltrsCp[fltr];
        }
        if (gridEnabledFltrs.every(fltr => btnFltrs[fltr]) &&
            Object.values(fltrsCp).every(active => !active)) {
            return;
        }
    
        const filterValues = Object.entries(btnFltrs)
            .filter(([_value, active]) => active)
            .map(([value, _active]) => [dataField, 'contains', value]);
        dg.instance.columnOption(dataField, 'filterValues', filterValues);
    }
};

/**
 * Update button filters according to the datagrid filterValues
 * @param {import('devextreme/ui/data_grid').OptionChangedEvent} event 
 * @param {Number} colIdx 
 * @param {import('./optionsfilters/buttonfilters').ButtonFiltersControls} btnCtrls 
 */
export const updateBtnFltrs = (event, colIdx, btnCtrls) => {
    if (event.fullName === `columns[${colIdx}].filterValues`) {
        let value = event.value || [];
        // If only a single filter has been selected, the filter values
        // array will be its filter expression, instead of a combination
        if (value.length && !Array.isArray(value[0])) {
            value = [value];
        }
        // Turning filter expressions to values
        value = value.map(fltrExpr => fltrExpr[2]);

        btnCtrls.boolSwitch(
            symmDiff(
                value,
                Object.entries(btnCtrls.fltrs)
                .filter(([_value, active]) => active)
                .map(([value, _active]) => value)
            )
        );
    }
};

const useDists = (selectedPlan, optionsDGRef, candidatesDGRef) => {
    // Distances object
    const [dists, setDists] = useState({});
    useEffect(() => {
        (async () => {
            setDists(
                selectedPlan && selectedPlan.city ?
                await getDistanceRequest(selectedPlan.city) : {}
            );
        })();
    }, [selectedPlan]);

    const distCalculateCellValue = data =>
        (selectedPlan && selectedPlan.city === data.city) ? 0 : (dists[data.city] || null);

    /**
     * Resorts the grids by dists.
     */
    const resortGrids = useCallback(() => {
        for (const dgRef of [optionsDGRef, candidatesDGRef]) {
            if (dgRef && dgRef.current) {
                /** @type {import('devextreme-react/data-grid').DataGrid} */
                const dg = dgRef.current;
                dg.instance.clearSorting();
                dg.instance.columnOption('dist', 'sortOrder', 'asc');
            }
        }
    }, [optionsDGRef, candidatesDGRef]);

    // Resorts the grids by dists when new distances are loaded
    useEffect(() => {
        resortGrids();
    }, [dists, resortGrids]);
 
    /**
     * OptionChanged event handler. Resorts grids by dists when content is ready, but only when necessary
     * @param {import('devextreme/ui/data_grid').OptionChangedEvent} event 
     */
    const resortByDistOptionChangedHandler = event => {
        // Preventing an infinite loop by 'columns[1].sortOrder' option changes
        // Preventing unnecessary resorts calls on unrelated option changes
        if (event.fullName === 'columns[1].sortOrder' ||
            ['hoveredElement', 'onRowPrepared'].includes(event.fullName)) {
            return;
        }

        // If datagrid is already supposed to be sorted by dists, then resort. Otherwise do nothing.
        const distSortIndex = event.component.columnOption('dist', 'sortIndex');
        if (distSortIndex === 0) {
            event.component.clearSorting();
            event.component.columnOption('dist', 'sortOrder', 'asc');
        }
    };

    return [distCalculateCellValue, resortGrids, resortByDistOptionChangedHandler];
};

export default useDists;