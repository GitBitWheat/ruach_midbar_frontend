import { useState, useEffect, useContext } from "react";
import { SchoolsContext } from "../../../store/SchoolsContextProvider";

const preparePlan = plan => (
    (({ instructor1, instructor2, instructor3, instructor4, ...rest }) => rest)({
        ...plan,
        instructors: [plan.instructor1, plan.instructor2, plan.instructor3, plan.instructor4]
        .filter(instructor => instructor)
    })
);

const usePlanSelect = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    const handlePlanChange = plan => {
        setSelectedPlanId(plan.id);
    };

    useEffect(() => {
        if (selectedPlanId) {
            const p = storeLookupData.plans.get(selectedPlanId);
            if (p) {
                const school = storeLookupData.schools.get(p.schoolId);
                if (school) {
                    setSelectedPlan({ ...preparePlan(p), city: school.city });
                } else {
                    setSelectedPlan(preparePlan(p));
                }
            }
        }
    }, [storeLookupData.plans, storeLookupData.schools, selectedPlanId]);

    return [selectedPlan, handlePlanChange];
};

export default usePlanSelect;