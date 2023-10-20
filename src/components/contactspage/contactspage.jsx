import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { DataGrid, HeaderFilter, Editing, Column, FormItem, Paging, Toolbar, Item,
         Lookup, ColumnChooser, ColumnFixing, StateStoring }
    from 'devextreme-react/data-grid';
    
import { SchoolsContext } from '../../store/SchoolsContextProvider';
import { SettingsContext } from '../settingscontext/settingscontext';
import useContactActions from '../schoolspage/usecontactactions';
import Contact from '../../store/storeModels/contact';
import SelectEditCell from '../customcells/selecteditcell/selecteditcell';
import WhatsappCell from '../customcells/whatsappcell/whatsappcell';
import useClearFiltersButton from '../../customhooks/useclearfiltersbutton/useclearfiltersbutton';

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './contactspagetext.json';



// The whatsapp column doesn't come from the data source itself, but rather needs to be computed
export const whatsappCellValue = data => {
    if (data.firstName && data.phone) {
        let text = data.firstName;
        if (data.role) {
            text += ` ${data.role}`;
        }
        return `${text}#whatsapp://send/?phone=${data.phone}#`;
    } else {
        return null;
    }
};

const ContactsPage = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;

    const settings = useContext(SettingsContext);

    const [resourceNameCellRender, addContactGoogleAndStore,
        deleteContactGoogleAndStore, updateContactGoogleAndStore] = useContactActions();

    const [schoolsDS, setSchoolsDS] = useState([]);
    useEffect(() => {
        setSchoolsDS(
            storeData.schools
            .map(school =>
                ({ id: school.id, nameCity: (school.name || '') + (school.city ? ' - ' + school.city : '') })
            )
        );
    }, [storeData.schools]);

    const handleRowInserting = useCallback(event => {
        const school = storeLookupData.schools.get(event.data.schoolId);
        const contact = new Contact({...event.data});
        const isCanceled = new Promise(resolve => {
            addContactGoogleAndStore(contact, school)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [addContactGoogleAndStore, storeLookupData]);

    const handleRowRemoving = useCallback(event => {
        const isCanceled = new Promise(resolve => {
            deleteContactGoogleAndStore(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [deleteContactGoogleAndStore]);

    const handleRowUpdating = useCallback(event => {
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
    }, [updateContactGoogleAndStore, storeLookupData]);

    // Using values from diffrent data fields for the school id column
    const schoolIdCellRender = useCallback(({ data }) => {
        const school = storeLookupData.schools.get(data.schoolId);
        return school ?
            <span>{(school.name || '') + (school.city ? ' - ' + school.city : '')}</span>
            : <span className='dataError'>{pageText.schoolNonExistentError}</span>;
    }, [storeLookupData.schools]);

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    return (
        <React.Fragment>
            <DataGrid
                ref={dgRef}
                dataSource={storeData.contacts}
                keyExpr='id'
                onRowInserting={handleRowInserting}
                onRowRemoving={handleRowRemoving}
                onRowUpdating={handleRowUpdating}
            >
                <Paging
                    enabled={true}
                    pageSize={settingsConstants.dataGridRowsPageSize}
                    defaultPageIndex={0}
                />
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
                <ColumnChooser enabled={true} />
                <ColumnFixing enabled={true} />
                <StateStoring
                    enabled={true}
                    type='localStorage'
                    storageKey='contactsDataGridStateStoring'
                />
                <Toolbar>
                    <Item
                        widget='dxButton'
                        options={clearFiltersButtonOptions}
                    />
                    <Item name='addRowButton' />
                    <Item name='columnChooserButton' />
                </Toolbar>

                <Column
                    dataField='schoolId'
                    caption={pageText.schoolName}
                    editCellComponent={SelectEditCell}
                    cellRender={schoolIdCellRender}
                >
                    <Lookup
                        dataSource={{
                            store: schoolsDS,
                            paginate: true,
                            pageSize: settingsConstants.columnLookupPageSize
                        }}
                        valueExpr='id'
                        displayExpr='nameCity'
                    />
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
                    caption={pageText.status}
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
        </React.Fragment>
    );
};



export default ContactsPage;