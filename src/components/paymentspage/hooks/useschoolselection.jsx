import { useState, useContext } from "react";
import { SchoolsContext } from "../../../store/SchoolsContextProvider";

const useSchoolSelection = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;

    // Filters the school for the whole page
    const [selectedSchool, setSelectedSchool] = useState(null);

    const handleSchoolSelectionChanged = ({ selectedRowsData }) => {
        if (selectedRowsData &&
            Array.isArray(selectedRowsData) &&
            selectedRowsData[0] &&
            typeof selectedRowsData[0] === 'object' &&
            Object.hasOwn(selectedRowsData[0], 'id')) {
            setSelectedSchool(storeLookupData.schools.get(selectedRowsData[0].id) || null);
        } else {
            setSelectedSchool(null);
        }
    };

    return [selectedSchool, handleSchoolSelectionChanged];
};

export default useSchoolSelection;