import { useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";
import Invitation from "../../../store/storeModels/invitation";

const useHandleCurrentInvitationsRowAction = selectedSchool => {
    const storeCtx = useContext(StoreContext);
    const storeMethods = storeCtx.methods;

    // Request the server to update the data source, proceed if request succeeded
    const handleInvitationsRowInserting = event => {
        if (selectedSchool === null) {
            event.cancel = true;
            return;
        }
        // Replace sym with schoolId
        const invitationData = new Invitation({
            ...event.data,
            sym: selectedSchool.sym,
            schoolName: selectedSchool.name,
            city: selectedSchool.city
        });
        const isCanceled = new Promise(resolve => {
            storeMethods.addInvitation(invitationData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleInvitationsRowRemoving = event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deleteInvitation(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handleInvitationsRowUpdating = event => {
        const invitationData = new Invitation({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updateInvitation(event.key, invitationData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    return [handleInvitationsRowInserting, handleInvitationsRowRemoving, handleInvitationsRowUpdating];
};

export default useHandleCurrentInvitationsRowAction;