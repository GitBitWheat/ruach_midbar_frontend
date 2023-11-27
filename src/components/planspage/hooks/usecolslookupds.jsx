import { useState, useEffect, useContext } from "react";
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import { uniques } from '../../../utils/arrayUtils';

/** Lookup datasources for the columns: status, invitation, district, plan, schoolName */
const useColsLookupDS = yearFilteredPlansDS => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const [statusesLookupDS, setStatusesLookupDS] = useState([]);
    useEffect(() => {
        setStatusesLookupDS(uniques(yearFilteredPlansDS.map(plan => plan.status).filter(val => val)));
    }, [yearFilteredPlansDS]);

    const [invitationsLookupDS, setInvitationsLookupDS] = useState([]);
    useEffect(() => {
        setInvitationsLookupDS(uniques(yearFilteredPlansDS.map(plan => plan.invitation).filter(val => val)));
    }, [yearFilteredPlansDS]);

    const [districtsLookupDS, setDistrictsLookupDS] = useState([]);
    useEffect(() => {
        setDistrictsLookupDS(uniques(yearFilteredPlansDS.map(plan => plan.district).filter(val => val)));
    }, [yearFilteredPlansDS]);

    const [schoolsLookupDS, setSchoolsLookupDS] = useState([]);
    useEffect(() => {
        setSchoolsLookupDS(storeData.schools.map(school => ({
            id: school.id,
            nameCity: school.name + (school.city ? ' - ' + school.city : '')
        })))
    }, [storeData.schools]);

    return [statusesLookupDS, invitationsLookupDS, districtsLookupDS, schoolsLookupDS];
};

export default useColsLookupDS;