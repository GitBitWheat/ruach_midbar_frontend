import { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";
import { useSelectBoxOptions } from '../../../customhooks/useselectbox/useselectbox';

const useSchoolsDS = dataYear => {
    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;

    const [schoolsDS, setSchoolsDS] = useState([]);
    useEffect(() => {
        let filteredPlans = [];
        if (dataYear === useSelectBoxOptions.ALL) {
            filteredPlans = storeData.plans;
        } else if (dataYear === useSelectBoxOptions.EMPTY) {
            filteredPlans = storeData.plans.filter(plan => !(!!plan.year));
        } else {
            filteredPlans = storeData.plans.filter(plan => plan.year === dataYear);
        }
        filteredPlans = filteredPlans.filter(plan => plan.proposal);

        const relevantSchools = new Set();
        for (const { schoolId } of filteredPlans) {
            const school = storeLookupData.schools.get(schoolId);
            if (school) {
                relevantSchools.add(school);
            }
        }
        setSchoolsDS([...relevantSchools]);
    }, [storeData.plans, storeLookupData.schools, dataYear]);

    return schoolsDS;
};

export default useSchoolsDS;