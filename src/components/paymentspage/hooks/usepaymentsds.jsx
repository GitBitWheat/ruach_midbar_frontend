import { useState, useEffect, useContext } from "react";
import { SchoolsContext } from "../../../store/SchoolsContextProvider";

const usePaymentsDS = selectedSchool => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    // DataSource of the payments DataGrids - filtered by selected school and year
    const [paymentsDS, setPaymentsDS] = useState([]);
    useEffect(() => {
        setPaymentsDS(
            selectedSchool ?
            storeData.payments.filter(payment => payment.sym === selectedSchool.sym) : []
        );
    }, [storeData.payments, selectedSchool]);

    return paymentsDS;
};

export default usePaymentsDS;