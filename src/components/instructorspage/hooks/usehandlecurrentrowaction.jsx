import { useContext } from 'react';
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import Instructor from "../../../store/storeModels/instructor";

const useHandleCurrentRowAction = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeMethods = storeCtx.methods;

    const handleRowInserting = event => {
        const instructor = new Instructor(event.data);
        const isCanceled = new Promise(resolve => {
            storeMethods.addInstructor(instructor)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowRemoving = event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deleteInstructor(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleRowUpdating = event => {
        const instructor = new Instructor({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updateInstructor(event.key, instructor)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    return [handleRowInserting, handleRowRemoving, handleRowUpdating];
};

export default useHandleCurrentRowAction;