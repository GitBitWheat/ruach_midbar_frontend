import { useContext } from 'react';
import { StoreContext } from '../../../store/StoreContextProvider';
import Plan from '../../../store/storeModels/plan';

const useHandleCurrentRowActions = (linkDSLst=[]) => {
    const storeCtx = useContext(StoreContext);
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    // Request the server to update the data source, proceed if request succeeded
    const handleRowInserting = event => {
        const school = storeLookupData.schools.get(event.data.schoolId);
        const planData = new Plan(school ? {
            ...event.data,
            institution: school.name,
            contact: school.representative,
            city: school.city,
            level: school.level,
            sym: school.sym
        } : { ...event.data });
        const isCanceled = new Promise(resolve => {
            storeMethods.addPlan(planData)
                .then((validationResult) => {
                    for (const linkDs of linkDSLst) {
                        linkDs.add(planData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowRemoving = event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deletePlan(event.key)
                .then((validationResult) => {
                    for (const linkDs of linkDSLst) {
                        linkDs.remove(event.data);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowUpdating = event => {
        const school = storeLookupData.schools.get(event.newData.schoolId || event.oldData.schoolId);
        const planData = new Plan(school ? {
            ...event.oldData,
            ...event.newData,
            institution: school.name,
            contact: school.representative,
            city: school.city,
            level: school.level,
            sym: school.sym
        } : { ...event.oldData, ...event.newData });
        const isCanceled = new Promise(resolve => {
            storeMethods.updatePlan(event.key, planData)
                .then((validationResult) => {
                    for (const linkDs of linkDSLst) {
                        linkDs.update(event.oldData, planData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    return [handleRowInserting, handleRowRemoving, handleRowUpdating];
};

export default useHandleCurrentRowActions;