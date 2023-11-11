import { useState, useEffect, useCallback } from "react";

import instsAreas from '../../../static/instructor_areas.json';
import instsTypes from '../../../static/instructor_types.json';

import { ButtonFiltersControls } from "./buttonfilters";

/**
 * @param {String} areaStorageKey localStorage key for the area filters
 * @param {String} typeStorageKey localStorage key for the type filters
 * @returns {Array<ButtonFiltersControls>} ButtonFiltersControls for instructor areas and types
 */
const useOptionsFilters = (areaStorageKey=null, typeStorageKey=null) => {

    const [areaFltrs, setAreaFltrs] = useState(Object.fromEntries(instsAreas.map(val => [val.value, false])));
    const [typeFltrs, setTypeFltrs] = useState(Object.fromEntries(instsTypes.map(val => [val.value, false])));

    // Update the fltrs according to storage keys
    useEffect(() => {
        let previousAreaFltrs = areaStorageKey && localStorage.getItem(areaStorageKey);
        try {
            previousAreaFltrs = JSON.parse(previousAreaFltrs);
        } catch(_err) {
            previousAreaFltrs = null;
        }
        let previousTypeFltrs = typeStorageKey && localStorage.getItem(typeStorageKey);
        try {
            previousTypeFltrs = JSON.parse(previousTypeFltrs);
        } catch(_err) {
            previousTypeFltrs = null;
        }

        setAreaFltrs(
            previousAreaFltrs || Object.fromEntries(instsAreas.map(val => [val.value, false]))
        );
        setTypeFltrs(
            previousTypeFltrs || Object.fromEntries(instsTypes.map(val => [val.value, false]))
        );
    }, [areaStorageKey, typeStorageKey]);

    const switchArea = useCallback(area => {
        const newFltrs = { ...areaFltrs };
        if (Array.isArray(area)) {
            for (const val of area) {
                newFltrs[val] = !newFltrs[val];
            }
        } else {
            newFltrs[area] = !newFltrs[area];
        }
        setAreaFltrs(newFltrs);
        if (areaStorageKey) {
            localStorage.setItem(areaStorageKey, JSON.stringify(newFltrs));
        }
    }, [areaFltrs, areaStorageKey]);
    const switchType = useCallback(type => {
        const newFltrs = { ...typeFltrs };
        if (Array.isArray(type)) {
            for (const val of type) {
                newFltrs[val] = !newFltrs[val];
            }
        } else {
            newFltrs[type] = !newFltrs[type];
        }
        setTypeFltrs(newFltrs);
        if (typeStorageKey) {
            localStorage.setItem(typeStorageKey, JSON.stringify(newFltrs));
        }
    }, [typeFltrs, typeStorageKey]);

    const enableAllAreas = useCallback(() => {
        const newFltrs = Object.fromEntries(instsAreas.map(val => [val.value, true]));
        setAreaFltrs(newFltrs);
        if (areaStorageKey) {
            localStorage.setItem(areaStorageKey, JSON.stringify(newFltrs));
        }
    }, [setAreaFltrs, areaStorageKey]);
    const enableAllTypes = useCallback(() => {
        const newFltrs = Object.fromEntries(instsTypes.map(val => [val.value, true]));
        setTypeFltrs(newFltrs);
        if (typeStorageKey) {
            localStorage.setItem(typeStorageKey, JSON.stringify(newFltrs));
        }
    }, [setTypeFltrs, typeStorageKey]);

    const disableAllAreas = useCallback(() => {
        const newFltrs = Object.fromEntries(instsAreas.map(val => [val.value, false]));
        setAreaFltrs(newFltrs);
        if (areaStorageKey) {
            localStorage.setItem(areaStorageKey, JSON.stringify(newFltrs));
        }
    }, [setAreaFltrs, areaStorageKey]);
    const disableAllTypes = useCallback(() => {
        const newFltrs = Object.fromEntries(instsTypes.map(val => [val.value, false]));
        setTypeFltrs(newFltrs);
        if (typeStorageKey) {
            localStorage.setItem(typeStorageKey, JSON.stringify(newFltrs));
        }
    }, [setTypeFltrs, typeStorageKey]);

    return [new ButtonFiltersControls({
        options: instsAreas,
        fltrs: areaFltrs,
        boolSwitch: switchArea,
        enableAll: enableAllAreas,
        disableAll: disableAllAreas
    }), new ButtonFiltersControls({
        options: instsTypes,
        fltrs: typeFltrs,
        boolSwitch: switchType,
        enableAll: enableAllTypes,
        disableAll: disableAllTypes
    })];
};

export default useOptionsFilters;