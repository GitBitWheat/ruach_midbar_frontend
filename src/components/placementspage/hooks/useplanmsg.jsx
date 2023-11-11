import { useState, useEffect, useContext } from "react";
import { messagesRequest } from "../../../utils/localServerRequests";
import { SchoolsContext } from "../../../store/SchoolsContextProvider";

const usePlanMsg = (selectedPlan, candidatesDS) => {
    const storeCtx = useContext(SchoolsContext);
    const storeMethods = storeCtx.methods;
    const storeLookupData = storeCtx.lookupData;

    const [msg, setMsg] = useState('');
    useEffect(() => {
        setMsg((selectedPlan && selectedPlan.msg) || '');
    }, [selectedPlan]);

    const updatePlanMsg = () => {
        storeMethods.updatePlan(selectedPlan.id, { ...storeLookupData.plans.get(selectedPlan.id), msg: msg });
    };

    /** @param {import('devextreme/ui/text_area').InputEvent} event */
    const handleMsgInput = event => { setMsg(event.event.target.value); };

    const sendMsgToCandidates = _event => {
        const filteredPlacedInstructors = candidatesDS.filter(cand => cand.action);
        messagesRequest(
            msg, '', '',
            filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[1]),
            filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[0]),
            '', null, null, null, () => {}
        );            
    };

    return [msg, handleMsgInput, updatePlanMsg, sendMsgToCandidates];
};

export default usePlanMsg;