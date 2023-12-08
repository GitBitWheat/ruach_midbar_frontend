import React, { useContext, useRef } from 'react';
import { DataGrid, HeaderFilter, Editing, Column, FormItem, Paging, Toolbar, Item,
         Lookup, ColumnChooser, ColumnFixing, StateStoring }
    from 'devextreme-react/data-grid';
    
import { calculateWhatsappCellValue } from './misc/calculatewhatsappcellvalue';

import useGoogleContactActions from '../../customhooks/usegooglecontactactions/usegooglecontactactions';
import useClearFiltersButton from '../../customhooks/useclearfiltersbutton/useclearfiltersbutton';
import useHandleCurrentRowActions from './hooks/usehandlecurrentrowactions';
import useSchoolsDS from './hooks/useschoolsds';

import { StoreContext } from '../../store/StoreContextProvider';
import { SettingsContext } from '../settingscontext/settingscontext';

import SchoolCellComponent from './misc/schoolcellcomponent';
import SelectEditCell from '../customcells/selecteditcell/selecteditcell';
import WhatsappCell from '../customcells/whatsappcell/whatsappcell';

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './contactspagetext.json';

const ContactsPage = () => {

    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    const settings = useContext(SettingsContext);

    const [resourceNameCellRender, addContactGoogleAndStore,
        deleteContactGoogleAndStore, updateContactGoogleAndStore] = useGoogleContactActions();
    
    const [handleRowInserting, handleRowRemoving, handleRowUpdating] =
        useHandleCurrentRowActions(addContactGoogleAndStore, deleteContactGoogleAndStore, updateContactGoogleAndStore);

    const schoolsDS = useSchoolsDS();

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    return <>
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
                cellComponent={SchoolCellComponent}
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
                calculateCellValue={calculateWhatsappCellValue}
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
    </>;
};

export default ContactsPage;