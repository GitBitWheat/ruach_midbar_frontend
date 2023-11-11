import React, { useEffect, useState, useContext } from 'react';
import { DataGrid, HeaderFilter, Editing, Column, FormItem, SearchPanel,
         Paging, ColumnChooser, ColumnFixing, StateStoring }
    from 'devextreme-react/data-grid';

import useGoogleContactActions from '../../../customhooks/usegooglecontactactions/usegooglecontactactions';
import useContactsDS from './hooks/usecontactsds';
import useRep from './hooks/userep';

import { calculateWhatsappCellValue } from '../../contactspage/misc/calculatewhatsappcellvalue';
import { handleCurrentRowAction } from './misc/handlecurrentrowaction';

import WhatsappCell from '../../customcells/whatsappcell/whatsappcell';

import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import { SettingsContext } from '../../settingscontext/settingscontext';

import settingsConstants from '../../../utils/settingsconstants.json';
import pageText from '../schoolspagetext.json';
import '../schoolspage.css';

const ContactsSubgrid = ({ data }) => {

    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;

    const settings = useContext(SettingsContext);

    const [dataKey, setDataKey] = useState(null);
    useEffect(() => {setDataKey(data.key);}, [data.key]);

    const school = storeLookupData.schools.get(dataKey);

    const city = school ? school.city : null;
    const schoolName = school ? school.name : null;

    const dataSource = useContactsDS(dataKey);

    // Turn to rep column logic
    const [turnRepCellRender, turnRepCalculateCellValue] = useRep(school);

    const [resourceNameCellRender, addContactGoogleAndStore,
        deleteContactGoogleAndStore, updateContactGoogleAndStore] = useGoogleContactActions();

    const [handleRowInserting, handleRowRemoving, handleRowUpdating] =
        handleCurrentRowAction(school, addContactGoogleAndStore,
        deleteContactGoogleAndStore, updateContactGoogleAndStore);

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
                        calculateCellValue={turnRepCalculateCellValue}
                        cellRender={turnRepCellRender}
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
                        calculateCellValue={calculateWhatsappCellValue}
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

export default ContactsSubgrid;