import { useContext } from "react";
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import useSearch from '../../../customhooks/usesearch';
import pageText from '../planspage-text.json';

const useSearchPlan = (yearFilteredPlansDS, dgRef) => {
    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;

    const processPlan = plan => {
        const school = storeLookupData.schools.get(plan.schoolId);
        if (school) {
            return {
                ...plan,
                level: school.level,
                sym: school.sym,
                schoolName: school.name,
                city: school.city,
                representative: school.representative
            };
        } else {
            return plan;
        }
    };
    
    // Displayed searched plans
    const [searchedPlansDS, searchOptions] = useSearch(yearFilteredPlansDS, pageText.search, dgRef, processPlan);

    return [searchedPlansDS, searchOptions];
};

export default useSearchPlan;