import { useState, useEffect, useContext } from "react";
import { SchoolsContext } from "../../../store/SchoolsContextProvider";

/**
 * Calculate the instructor data sources (the options and the placed candidates)
 * @param {Plan} selectedPlan 
 * @param {Array} instructors 
 * @param {Array} instructorPlacements 
 */
const calculateDataSources = (selectedPlan, instructors, instructorPlacements) => {
    if (selectedPlan) {
        const newCandidatesDSIds = instructorPlacements
            .filter(placement => placement.planId === selectedPlan.id)
            .map(placement => placement.instructorId);
        
        const newOptionsDS = [];
        const newCandidatesDS = [];

        for (const inst of instructors) {
            if (newCandidatesDSIds.includes(inst.id)) {
                newCandidatesDS.push({...inst, action: false});
            } else {
                newOptionsDS.push({...inst, action: false});
            }
        }

        return [newOptionsDS, newCandidatesDS];

    } else {
        return [[], []];
    }
};

const useInstDataSources = (selectedPlan) => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const [optionsDS, setOptionsDS] = useState([]);
    const [candidatesDS, setCandidatesDS] = useState([]);

    // Recalculate the data sources from scratch when the selected plan or list of instructors changes
    useEffect(() => {
        const [newOptionsDS, newCandidatesDS] =
            calculateDataSources(selectedPlan, storeData.instructors, storeData.instructorPlacements);
        setOptionsDS(newOptionsDS);
        setCandidatesDS(newCandidatesDS);
    }, [selectedPlan, storeData.instructors, storeData.instructorPlacements]);

    return [optionsDS, candidatesDS];
}

export default useInstDataSources;