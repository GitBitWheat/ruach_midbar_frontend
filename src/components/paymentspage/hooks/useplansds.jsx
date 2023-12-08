import { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";
import { useSelectBoxOptions } from '../../../customhooks/useselectbox/useselectbox';

const usePlansDS = (selectedSchool, dataYear) => {
    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    // DataSource of the plans DataGrid - show plans of selected school and of the selected year
    const [plansDS, setPlansDS] = useState([]);
    useEffect(() => {
        if (!(!!selectedSchool)) {
            setPlansDS([]);
        } else if (dataYear === useSelectBoxOptions.ALL) {
            setPlansDS(
                storeData.plans.filter(plan => plan.schoolId === selectedSchool.id)
            );
        } else if (dataYear === useSelectBoxOptions.EMPTY) {
            setPlansDS(
                storeData.plans.filter(plan => plan.schoolId === selectedSchool.id && !(!!plan.year))
            );
        } else {
            setPlansDS(
                storeData.plans.filter(plan => plan.schoolId === selectedSchool.id && plan.year === dataYear)
            );
        }
    }, [storeData.plans, selectedSchool, dataYear]);

    return plansDS;
};

export default usePlansDS;