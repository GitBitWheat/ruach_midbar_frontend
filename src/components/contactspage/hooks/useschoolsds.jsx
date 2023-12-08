import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../../store/StoreContextProvider';

const useSchoolsDS = () => {
    const storeCtx = useContext(StoreContext);
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