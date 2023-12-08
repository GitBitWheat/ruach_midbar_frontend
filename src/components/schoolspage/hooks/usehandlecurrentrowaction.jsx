import { useContext } from 'react';
import { StoreContext } from '../../../store/StoreContextProvider';
import School from '../../../store/storeModels/school';

const useHandleCurrentRowAction = (linkDsLst=[]) => {
    const storeCtx = useContext(StoreContext);
    const storeMethods = storeCtx.methods;

    const handleRowInserting = event => {
        const schoolData = new School(event.data);
        const isCanceled = new Promise(resolve => {
            storeMethods.addSchool(schoolData)
                .then((validationResult) => {
                    for (const linkDs of linkDsLst) {
                        linkDs.add(schoolData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowRemoving = event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deleteSchool(event.key)
                .then((validationResult) => {
                    for (const linkDs of linkDsLst) {
                        linkDs.remove(event.data);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowUpdating = event => {
        const schoolData = new School({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updateSchool(event.key, schoolData)
                .then((validationResult) => {
                    for (const linkDs of linkDsLst) {
                        linkDs.update(event.oldData, schoolData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    return [handleRowInserting, handleRowRemoving, handleRowUpdating];
};

export default useHandleCurrentRowAction;