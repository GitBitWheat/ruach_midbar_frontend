import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../../../store/StoreContextProvider';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

const getContacts = (contacts, schoolId) =>
    new DataSource({
        store: new ArrayStore({
            data: contacts,
            key: 'id',
        }),
        filter: ['schoolId', '=', schoolId],
    });

const useContactsDS = schoolId => {
    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    const [contactsDS, setContactsDS] = useState(null);
    useEffect(() => {
        setContactsDS(getContacts(storeData.contacts, schoolId));
    }, [storeData.contacts, schoolId]);

    return contactsDS;
};

export default useContactsDS;