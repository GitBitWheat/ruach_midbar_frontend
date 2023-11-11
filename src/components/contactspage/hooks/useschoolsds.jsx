import { useState, useEffect, useContext } from 'react';
import { SchoolsContext } from '../../../store/SchoolsContextProvider';

const useSchoolsDS = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const [schoolsDS, setSchoolsDS] = useState([]);
    useEffect(() => {
        setSchoolsDS(
            storeData.schools
            .map(school =>
                ({ id: school.id, nameCity: (school.name || '') + (school.city ? ' - ' + school.city : '') })
            )
        );
    }, [storeData.schools]);

    return schoolsDS;
};

export default useSchoolsDS;