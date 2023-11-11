import Contact from '../../../../store/storeModels/contact';

export const handleCurrentRowAction = (school, addContactGoogleAndStore, deleteContactGoogleAndStore,
    updateContactGoogleAndStore) => {

    const handleRowInserting = event => {
        const contact = new Contact({...event.data, schoolId: school.id, schoolName: school.name});
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
            deleteContactGoogleAndStore(event.key, event.data.googleContactsResourceName) 
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowUpdating = event => {
        const contact = new Contact({...event.oldData, ...event.newData});
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