import { useContext } from 'react';
import useSelectBox, { useSelectBoxOptions } from "../../../customhooks/useselectbox/useselectbox";
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import { SettingsContext } from "../../settingscontext/settingscontext";

const usePlacedInstsByYear = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const settings = useContext(SettingsContext);

    // Year of plans for placed instructors
    const [dataYear, yearSelectBoxProps] = useSelectBox(storeData.plans, 'year', settings.defaultYear);

    const placedCalculateCellValue = instructor =>
        dataYear === useSelectBoxOptions.ALL ?
        storeData.plans.some(plan =>
            ([...Array(4).keys()])
            .map(idx => plan[`instructor${idx+1}`])
            .some(placedInstFirstName =>
                placedInstFirstName && placedInstFirstName.includes(instructor.firstName))
        ) :
        storeData.plans.some(plan =>
            plan.year && plan.year === dataYear &&
            ([...Array(4).keys()])
            .map(idx => plan[`instructor${idx+1}`])
            .some(placedInstFirstName =>
                placedInstFirstName && placedInstFirstName.includes(instructor.firstName))
        );
    
    return [yearSelectBoxProps, placedCalculateCellValue];
};

export default usePlacedInstsByYear;