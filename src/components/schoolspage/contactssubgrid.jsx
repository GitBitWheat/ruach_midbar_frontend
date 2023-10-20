import React, { useEffect, useState, useContext, useCallback } from 'react';
import { DataGrid, HeaderFilter, Editing, Column, FormItem, SearchPanel,
         Paging, ColumnChooser, ColumnFixing, StateStoring }
    from 'devextreme-react/data-grid';

import { Button } from 'devextreme-react';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import WhatsappCell from '../customcells/whatsappcell/whatsappcell';

import { SchoolsContext } from '../../store/SchoolsContextProvider';
import { SettingsContext } from '../settingscontext/settingscontext';
import Contact from '../../store/storeModels/contact';
import useContactActions from './usecontactactions';

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './schoolspagetext.json';
import './schoolspage.css';

const ContactsSubgrid = ({ data }) => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    const settings = useContext(SettingsContext);

    const [dataKey, setDataKey] = useState(null);
    useEffect(() => {setDataKey(data.key);}, [data.key]);

    const school = storeLookupData.schools.get(dataKey);

    const city = school ? school.city : null;
    const schoolName = school ? school.name : null;

    const [dataSource, setDataSource] = useState(null);
    useEffect(() => {
        setDataSource(getContacts(storeData.contacts, dataKey));
    }, [dataKey, storeData.contacts]);



    const contactToRep = useCallback((firstName, role, phone) => {
        if (!school) {
            console.error('Cannot find the school of this contact');
            return;
        }
        storeMethods.updateSchool(school.id, {...school,
            representative: `${firstName}${role ? ' ' + role : ''}#whatsapp://send/?phone=${(phone.startsWith('972') ? '': '972') + phone}#`});
    }, [storeMethods, school]);

    const turnRepButton = useCallback(({ value }) => {
        return (
            <Button
                text={pageText.turnRep}
                onClick={_event => {contactToRep(value.firstName, value.role, value.phone);}}
                className={'noPaddingButton' + (value.isRep ? ' repBtn' : '')}
                disabled={value.isRep}
            />
        );
    }, [contactToRep]);

    // Calculation of the cell value for the turn rep column
    const turnRepCellValue = useCallback(data => ({
        firstName: data.firstName,
        role: data.role,
        phone: data.phone,
        isRep: school.representative &&
            (data.role ?
                (new RegExp(`^${data.firstName}\\s+${data.role}(.*)`)).test(school.representative) :
                data.firstName === school.representative.split('#')[0])
    }), [school]);

    const [resourceNameCellRender, addContactGoogleAndStore,
        deleteContactGoogleAndStore, updateContactGoogleAndStore] = useContactActions();

    const handleRowInserting = useCallback(event => {
        const contact = new Contact({...event.data, schoolId: dataKey, schoolName: school.name});
        const isCanceled = new Promise(resolve => {
            addContactGoogleAndStore(contact, school)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [addContactGoogleAndStore, dataKey, school]);

    const handleRowRemoving = useCallback(event => {
        const isCanceled = new Promise(resolve => {
            deleteContactGoogleAndStore(event.key, event.data.googleContactsResourceName) 
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [deleteContactGoogleAndStore]);

    const handleRowUpdating = useCallback(event => {
        const contact = new Contact({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            updateContactGoogleAndStore(event.key, contact, school)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [updateContactGoogleAndStore, school]);



    // The whatsapp column doesn't come from the data source itself, but rather needs to be computed
    const whatsappCellValue = useCallback(data => {
        if (data.firstName && data.phone) {
            let text = data.firstName;
            if (data.role) {
                text += ` ${data.role}`;
            }
            return `${text}#whatsapp://send/?phone=${data.phone}#`;
        } else {
            return null;
        }
    }, []);



    return (
        <div className='contactsSubgridContainer'>
            {dataSource && (<>
                <div className="master-detail-caption">
                    {`${city} - ${schoolName}`}
                </div>
                <DataGrid
                    dataSource={dataSource}
                    keyExpr='id'
                    onRowInserting={handleRowInserting}
                    onRowRemoving={handleRowRemoving}
                    onRowUpdating={handleRowUpdating}
                    className='contactsSubgridContainer'
                >
                    <Editing
                        mode={settings.editMode || 'cell'}
                        allowUpdating={true}
                        allowAdding={true}
                        allowDeleting={true}
                    />
                    <HeaderFilter
                        visible={true}
                        search={{ enabled: true }}
                        height={settingsConstants.headerFilterHeight}
                    />
                    <SearchPanel
                        visible={true}
                        key='firstName'
                        width={240}
                        placeholder={pageText.searchContact}
                        highlightSearchText={true}
                    />
                    <Paging
                        enabled={true}
                        pageSize={settingsConstants.dataGridRowsPageSize}
                        defaultPageIndex={0}
                    />
                    <ColumnChooser enabled={true} />
                    <ColumnFixing enabled={true} />
                    <StateStoring
                        enabled={true}
                        type='localStorage'
                        storageKey='contactsSubgridDataGridStateStoring'
                    />

                    <Column
                        caption={pageText.turnRep}
                        calculateCellValue={turnRepCellValue}
                        cellRender={turnRepButton}
                        allowEditing={false}
                        width={80}
                    >
                        <FormItem visible={false} />
                    </Column>
                    <Column
                        dataField='firstName'
                        dataType='string'
                        caption={pageText.firstName}
                    />
                    <Column
                        dataField='lastName'
                        dataType='string'
                        caption={pageText.lastName}
                    />
                    <Column
                        dataField='phone'
                        dataType='string'
                        caption={pageText.phone}
                    />
                    <Column
                        dataField='role'
                        dataType='string'
                        caption={pageText.role}
                    />
                    <Column
                        dataType='string'
                        caption={pageText.whatsapp}
                        cellRender={WhatsappCell}
                        calculateCellValue={whatsappCellValue}
                        allowEditing={false}
                    >
                        <FormItem visible={false} />
                    </Column>
                    <Column
                        dataField='status'
                        dataType='string'
                        caption={pageText.contactStatus}
                    />
                    <Column
                        dataField='googleContactsResourceName'
                        dataType='string'
                        caption={pageText.googleContactsLink}
                        cellRender={resourceNameCellRender}
                        allowEditing={false}
                    >
                        <FormItem visible={false} />
                    </Column>

                </DataGrid>
            </>)}
        </div>
    );
};

function getContacts(contacts, key) {
    return new DataSource({
        store: new ArrayStore({
            data: contacts,
            key: 'id',
        }),
        filter: ['schoolId', '=', key],
    });
}

export default ContactsSubgrid;