import { useState, useCallback } from "react";

import instsAreas from '../../../static/instructor_areas.json';
import instsTypes from '../../../static/instructor_types.json';

import { ButtonFiltersControls } from "./buttonfilters";

/**
 * @returns {Array<ButtonFiltersControls>}
 */
const useOptionsFilters = () => {

    const [areaFltrs, setAreaFltrs] = useState(
        Object.fromEntries(instsAreas.map(val => [val.value, false]))
    );
    const [typeFltrs, setTypeFltrs] = useState(
        Object.fromEntries(instsTypes.map(val => [val.value, false]))
    );

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
    }, [areaFltrs]);
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
    }, [typeFltrs]);

    const enableAllAreas = useCallback(() => {
        setAreaFltrs(
            Object.fromEntries(instsAreas.map(val => [val.value, true]))
        );
    }, [setAreaFltrs]);
    const enableAllTypes = useCallback(() => {
        setTypeFltrs(
            Object.fromEntries(instsTypes.map(val => [val.value, true]))
        );
    }, [setTypeFltrs]);

    const disableAllAreas = useCallback(() => {
        setAreaFltrs(
            Object.fromEntries(instsAreas.map(val => [val.value, false]))
        );
    }, [setAreaFltrs]);
    const disableAllTypes = useCallback(() => {
        setTypeFltrs(
            Object.fromEntries(instsTypes.map(val => [val.value, false]))
        );
    }, [setTypeFltrs]);

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