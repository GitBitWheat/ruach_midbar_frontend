import { useState, useEffect, useContext } from 'react';
import useSelectBox, { useSelectBoxOptions } from '../../../customhooks/useselectbox/useselectbox';
import { StoreContext } from '../../../store/StoreContextProvider'
import { SettingsContext } from '../../settingscontext/settingscontext';

const useYearFilteredDS = () => {

    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    const settings = useContext(SettingsContext);

    // Year of which the datasources are filtered
    const [dataYear, yearSelectBoxProps] = useSelectBox(storeData.plans, 'year', settings.defaultYear);

    const [yearFilteredPlansDS, setYearFilteredPlansDS] = useState([]);
    useEffect(() => {
        if (dataYear === useSelectBoxOptions.ALL) {
            setYearFilteredPlansDS(storeData.plans);
        } else if (dataYear === useSelectBoxOptions.EMPTY) {
            setYearFilteredPlansDS(storeData.plans.filter(plan => !(!!plan.year)))
        } else {
            setYearFilteredPlansDS(storeData.plans.filter(plan => plan.year === dataYear));
        }
    }, [storeData.plans, dataYear]);

    return [dataYear, yearFilteredPlansDS, yearSelectBoxProps];
}

export default useYearFilteredDS;