import { useState, useEffect, useContext } from 'react';
import Circle from '@uiw/react-color-circle';
import { SchoolsContext } from '../../../../store/SchoolsContextProvider';
import './usecolors.css';

const whiteHex = '#ffffff';

const useColors = (selectedPlanId, candidatesDS) => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    // Map from instructor id to its corresponding color according to the selected plan
    const [instructorToColorId, setInstructorToColorId] = useState({});

    useEffect(() => {
        setInstructorToColorId(Object.fromEntries(storeData.instructorPlanColors
            .filter(ipColor => ipColor.planId === selectedPlanId)
            .map(ipColor => [ipColor.instructorId, ipColor.colorId])));
    }, [storeData.instructorPlanColors, selectedPlanId]);

    const instructorToColorHex = instructorId => instructorId in instructorToColorId ?
        storeLookupData.colors.get(instructorToColorId[instructorId]).hex : whiteHex;
    
    // Map each color id to the next
    const [candidateColorIds, setCandidateColorIds] = useState(new Map());
    const [optionalColorIds, setOptionalColorIds] = useState(new Map());
    
    // Default color for optional and candidate instructors
    const [candidateColorDefault, setCandidateColorDedault] = useState(null);
    const [optionalColorDefault, setOptionalColorDedault] = useState(null);

    // Creating maps used as "linked lists" for colors for optional and candidate instructors
    useEffect(() => {
        const candidateColorIdMap = new Map();
        const optionalColorIdMap = new Map();
        let lastCandidateColorId = -1;
        let lastOptionalColorId = -1;

        for (const color of storeData.colors) {
            if (color.forPlaced) {
                candidateColorIdMap.set(lastCandidateColorId, color.id);
                lastCandidateColorId = color.id;

                if (color.default) {
                    setCandidateColorDedault(color.id);
                }
            } else {
                optionalColorIdMap.set(lastOptionalColorId, color.id);
                lastOptionalColorId = color.id;

                if (color.default) {
                    setOptionalColorDedault(color.id);
                }
            }
        }

        candidateColorIdMap.set(lastCandidateColorId, -1);
        optionalColorIdMap.set(lastOptionalColorId, -1);

        setCandidateColorIds(candidateColorIdMap);
        setOptionalColorIds(optionalColorIdMap);
    }, [storeData.colors]);

    /**
     * Template for a click event handler of the color circle. Switches to the next color.
     * @param {Number} key Id of the instructor
     * @param {Map} colorIds A map that is used like a "linked list" for the colors. Switching a color means
     * switching to the next color by the map, i.e. a key in the map is a color id and the value is the id of
     * the next color.
     */
    const switchColorClickEvent = (key, colorIds) =>
        /** @param {React.MouseEventHandler<HTMLDivElement>} event */
        event => {
            event.preventDefault();
            event.stopPropagation();

            const hasColor = key in instructorToColorId;
            const newColorId = colorIds.get(hasColor ? instructorToColorId[key] : -1);
            if (!hasColor) {
                if (newColorId !== -1) {
                    storeMethods.addInstructorPlanColor(key, selectedPlanId, newColorId);
                }
            }
            else if (newColorId !== -1) {
                storeMethods.updateInstructorPlanColor(key, selectedPlanId, newColorId);
            }
            else {
                storeMethods.deleteInstructorPlanColor(key, selectedPlanId);
            }
        };

    // Cell render functions for the color circle columns in the candidate and optional instructor datagrids
    const candidateCellRender = ({ key }) => {
        const candidateSwitchColorClickEvent = switchColorClickEvent(key, candidateColorIds);
        return (
            <Circle
                colors={[instructorToColorHex(key)]}
                onClick={candidateSwitchColorClickEvent}
                className='centeredColor'
            />
        );
    };

    const optionalCellRender = ({ key }) => {
        const optionalSwitchColorClickEvent = switchColorClickEvent(key, optionalColorIds);
        return (
            <Circle
                colors={[instructorToColorHex(key)]}
                onClick={optionalSwitchColorClickEvent}
                className='centeredColor'
            />
        );
    };

    // Switch the color of selected candidate instructors (the action property) to default
    const candidatesSwitchColorToDefault = () => {
        for (const placedInstructor of candidatesDS) {
            if (placedInstructor.action) {
                if (placedInstructor.id in instructorToColorId) {
                    storeMethods.updateInstructorPlanColor(placedInstructor.id, selectedPlanId, candidateColorDefault);
                } else {
                    storeMethods.addInstructorPlanColor(placedInstructor.id, selectedPlanId, candidateColorDefault);
                }
            }
        }
    };

    // Switch the color of an optional instructor (the action property) to default
    const optionSwitchColorToDefault = instId => {
        storeMethods.deleteInstructorPlacement(instId, selectedPlanId);

        if (instId in instructorToColorId) {
            storeMethods.updateInstructorPlanColor(instId, selectedPlanId, optionalColorDefault);
        } else {
            storeMethods.addInstructorPlanColor(instId, selectedPlanId, optionalColorDefault);
        }
    };

    // Delete color of instructor
    const deleteColor = instId => {
        storeMethods.deleteInstructorPlanColor(instId, selectedPlanId);
    };

    return [candidateCellRender, optionalCellRender, candidatesSwitchColorToDefault,
        optionSwitchColorToDefault, deleteColor];
};

export default useColors;