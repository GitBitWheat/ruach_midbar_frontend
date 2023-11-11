import React, { useContext, useRef } from 'react';

import { SchoolsContext } from '../../store/SchoolsContextProvider'
import { SettingsContext } from '../settingscontext/settingscontext';

import useLinkDataSource from '../../customhooks/uselinkdatasource';
import useSearch from '../../customhooks/usesearch';
import useClearFiltersButton from '../../customhooks/useclearfiltersbutton/useclearfiltersbutton';

import DataGrid,
    { Column, Editing, Paging, HeaderFilter, MasterDetail,
      ColumnChooser, ColumnFixing, StateStoring, Toolbar, Item }
    from "devextreme-react/data-grid";
import ContactsSubgrid from "./contactssubgrid";
import WhatsappCell from '../customcells/whatsappcell/whatsappcell';
import WhatsappEditCell from '../customcells/whatsappcell/whatsappeditcell';

import { clickSchoolNameCellForExpandingRow } from './misc/clickschoolnamecellforexpandingrow';
import useHandleCurrentRowAction from './hooks/usehandlecurrentrowaction';
import handleDoneRowAction from './misc/handledonerowaction';

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './schoolspagetext.json';

const SchoolsPage = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const settings = useContext(SettingsContext);

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    const [schoolsDS, searchOptions] = useSearch(storeData.schools, pageText.searchSchool, dgRef);

    // Filter data sources for link columns
    const repLinkDs = useLinkDataSource(storeData.schools, 'representative');

    const [handleRowInserting, handleRowRemoving, handleRowUpdating] = useHandleCurrentRowAction(repLinkDs);

    // Update link data sources after updating plans data source, and log the update
    const [handleRowInserted, handleRowRemoved, handleRowUpdated] = handleDoneRowAction();

    return (
        <div className="schoolTable">
            <div id="data-grid-demo">
                <DataGrid
                    ref={dgRef}
                    dataSource={schoolsDS}
                    keyExpr="id"
                    onRowInserting={handleRowInserting}
                    onRowRemoving={handleRowRemoving}
                    onRowUpdating={handleRowUpdating}
                    onRowInserted={handleRowInserted}
                    onRowRemoved={handleRowRemoved}
                    onRowUpdated={handleRowUpdated}
                    onCellPrepared={clickSchoolNameCellForExpandingRow}
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
                        storageKey='schoolsDataGridStateStoring'
                    />
                    <Toolbar>
                        <Item
                            widget='dxButton'
                            options={clearFiltersButtonOptions}
                        />
                        <Item name='addRowButton' />
                        <Item name='columnChooserButton' />
                        <Item
                            widget='dxTextBox'
                            options={searchOptions}
                        />
                    </Toolbar>

                    <Column
                        dataField='name'
                        dataType='string'
                        caption={pageText.name}
                    />
                    <Column
                        dataField='sym'
                        dataType='number'
                        caption={pageText.sym}
                    />
                    <Column
                        dataField='level'
                        dataType='string'
                        caption={pageText.level}
                    />
                    <Column
                        dataField='sector'
                        dataType='string'
                        caption={pageText.sector}
                    />
                    <Column
                        dataField='schoolType'
                        dataType='string'
                        caption={pageText.schoolType}
                    />
                    <Column
                        dataField='city'
                        dataType='string'
                        caption={pageText.city}
                    />
                    <Column
                        dataField='representative'
                        dataType='string'
                        caption={pageText.representative}
                        cellRender={WhatsappCell}
                        editCellComponent={WhatsappEditCell}
                    >
                        <HeaderFilter dataSource={repLinkDs.dataSource} />
                    </Column>
                    <Column
                        dataField='schoolDate'
                        dataType='date'
                        caption={pageText.date}
                        format='dd/MM/yyyy'
                    />
                    <Column
                        dataField='status'
                        dataType='string'
                        caption={pageText.status}
                    />

                    <MasterDetail
                        enabled={true}
                        component={ContactsSubgrid}
                    />
                </DataGrid>
            </div>
        </div>

    );
};

export default SchoolsPage;