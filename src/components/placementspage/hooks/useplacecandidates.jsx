import { useContext } from 'react';
import pageText from '../placementspagetext.json';
import { StoreContext } from "../../../store/StoreContextProvider";

const usePlaceCandidates = (selectedPlan, candidatesDS) => {
    const storeCtx = useContext(StoreContext);
    const storeMethods = storeCtx.methods;

    const placeCandidates = _event => {
        const instructorsLen = selectedPlan.instructors.length;

        if (instructorsLen >= 4) {
            alert(pageText.planIsFull);
            return;
        }

        const instructorSlotsNum = 4;
        const emptySlotsNum = instructorSlotsNum - instructorsLen;

        const newInstructors = candidatesDS
            .filter(pi => pi.action)
            .map(pi => (pi.firstName || '') + (pi.lastName ? ' ' + pi.lastName : ''))

        if (newInstructors.length > emptySlotsNum) {
            alert(pageText.choseMoreCandidatesThanEmptySlots);
            return;
        }
        else if (newInstructors.length === 0) {
            alert(pageText.noChosenCandidates);
            return;
        }

        storeMethods.placeCandidates(selectedPlan.id, newInstructors, instructorsLen + 1);
    };

    const cancelPlacement1 =  _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 1);
    const cancelPlacement2 =  _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 2);
    const cancelPlacement3 =  _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 3);
    const cancelPlacement4 =  _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 4);

    return [
        placeCandidates, cancelPlacement1, cancelPlacement2, cancelPlacement3, cancelPlacement4,
    ];
};

export default usePlaceCandidates;