import { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";

const useContactsDS = selectedSchool => {
    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    // DataSource of the contacts DataGrid - Shows contacts of selected school
    const [contactsDS, setContactsDS] = useState([]);
    useEffect(() => {
        setContactsDS(
            selectedSchool ?
            storeData.contacts.filter(contact => contact.schoolId === selectedSchool.id) : []
        );
    }, [storeData.contacts, selectedSchool]);

    return contactsDS;
};

export default useContactsDS;