import { useContext } from 'react';
import { StoreContext } from '../../../store/StoreContextProvider';
import Instructor from "../../../store/storeModels/instructor";

/**
 * Supplies a DataGrid RowUpdating event handler for the instructor tables
 * in placements page.
 */
const useHandleInstNotesUpdating = () => {
    const storeCtx = useContext(StoreContext);
    const storeMethods = storeCtx.methods;

    /**
     * DataGrid RowUpdating event handler for the instructor tables
     * in placements page.
     * Updates the instructor notes to the database and those only.
     * @param {import('devextreme/ui/data_grid').RowUpdatingEvent} event
     */
    return event => {
        // Only update the database if a change in the notes field has been detected
        if (event.newData.notes) {
            const instructor = new Instructor({...event.oldData, ...event.newData});
            const isCanceled = new Promise(resolve => {
                storeMethods.updateInstructor(event.key, instructor)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
            });
            event.cancel = isCanceled;
        }
    };
};

export default useHandleInstNotesUpdating;