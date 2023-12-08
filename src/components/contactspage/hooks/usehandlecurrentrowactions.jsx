import { useContext } from 'react';
import { StoreContext } from '../../../store/StoreContextProvider';
import Contact from '../../../store/storeModels/contact';

const useHandleCurrentRowActions =
    (addContactGoogleAndStore, deleteContactGoogleAndStore, updateContactGoogleAndStore) => {

    const storeCtx = useContext(StoreContext);
    const storeLookupData = storeCtx.lookupData;

    const handleRowInserting = event => {
        const school = storeLookupData.schools.get(event.data.schoolId);
        const contact = new Contact({...event.data});
        const isCanceled = new Promise(resolve => {
            addContactGoogleAndStore(contact, school)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowRemoving = event => {
        const isCanceled = new Promise(resolve => {
            deleteContactGoogleAndStore(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowUpdating = event => {
        const eventData = {...event.oldData, ...event.newData};
        const school = storeLookupData.schools.get(eventData.schoolId);
        const contact = new Contact({...eventData});
        const isCanceled = new Promise(resolve => {
            updateContactGoogleAndStore(event.key, contact, school)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    return [handleRowInserting, handleRowRemoving, handleRowUpdating];
};

export default useHandleCurrentRowActions;