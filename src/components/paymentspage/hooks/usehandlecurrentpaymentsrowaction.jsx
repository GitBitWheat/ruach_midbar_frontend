import { useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";
import Payment from "../../../store/storeModels/payment";

const useHandleCurrentPaymentsRowAction = selectedSchool => {
    const storeCtx = useContext(StoreContext);
    const storeMethods = storeCtx.methods;

    // Request the server to update the data source, proceed if request succeeded
    const handlePaymentsRowInserting = event => {
        if (selectedSchool === null) {
            event.cancel = true;
            return;
        }
        // Replace sym with schoolId
        const paymentData = new Payment({
            ...event.data,
            sym: selectedSchool.sym,
            schoolName: selectedSchool.name,
            city: selectedSchool.city
        });
        const isCanceled = new Promise(resolve => {
            storeMethods.addPayment(paymentData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handlePaymentsRowRemoving = event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deletePayment(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    const handlePaymentsRowUpdating = event => {
        const paymentData = new Payment({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updatePayment(event.key, paymentData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    };

    return [handlePaymentsRowInserting, handlePaymentsRowRemoving, handlePaymentsRowUpdating];
};

export default useHandleCurrentPaymentsRowAction;