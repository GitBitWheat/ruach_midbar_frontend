import { useContext, useCallback } from "react";
import { StoreContext } from '../../../store/StoreContextProvider';
import useSearch from '../../../customhooks/usesearch';
import pageText from '../planspage-text.json';

const useSearchPlan = (yearFilteredPlansDS, dgRef) => {
    const storeCtx = useContext(StoreContext);
    const storeLookupData = storeCtx.lookupData;

    // When a plan is searched, that causes a rerender in the useSearch hook, which causes a rerender here.
    // If processPlan is not memoized, its regeneration will cause a rerender in the useSearch hook and
    // the result is an infinite loop.
    const processPlan = useCallback(plan => {
        const school = storeLookupData.schools.get(plan.schoolId);
        return school ? {
            ...plan,
            level: school.level,
            sym: school.sym,
            schoolName: school.name,
            city: school.city,
            representative: school.representative
        } : plan;
    }, [storeLookupData.schools]);
    
    // Displayed searched plans
    const [searchedPlansDS, searchOptions] = useSearch(yearFilteredPlansDS, pageText.search, dgRef, processPlan);

    return [searchedPlansDS, searchOptions];
};

export default useSearchPlan;