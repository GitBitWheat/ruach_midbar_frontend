import React, { useContext, useCallback, useMemo, useRef } from 'react';

import { SchoolsContext } from '../../store/SchoolsContextProvider'
import { SettingsContext } from '../settingscontext/settingscontext';

import School from '../../store/storeModels/school';
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

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './schoolspagetext.json';

/**
 * A short click on a school name column cell expands the contacts list of that school.
 * A long click enables editing for that cell (assuming the editing mode supports editing by cell)
 * @param {import("devextreme/ui/data_grid").CellPreparedEvent} event The cell prepared event
 */
const clickSchoolNameCellForExpandingRow = event => {
    if (event.column.dataField === 'name' && event.rowType !== 'header') {
        let timeout;
        let isLongClick = false;
        event.cellElement.addEventListener('mousedown', _mouseDownEvent => {
            timeout = setTimeout(() => {
                isLongClick = true;

                const editMode = event.component.option('editing').mode;
                if (['batch', 'cell'].includes(editMode)) {
                    event.component.editCell(event.rowIndex, 'name');
                }
            }, 200);
        });
        event.cellElement.addEventListener('mouseup', _mouseUpEvent => {
            clearTimeout(timeout);
        });

        event.cellElement.classList.add('expandRowCell');
        event.cellElement.addEventListener('click', clickEvent => {
            if (!isLongClick) {
                if (event.row.isExpanded) {
                    event.component.collapseRow(event.row.key);
                } else {
                    event.component.expandRow(event.row.key);
                }
            }
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            isLongClick = false;
        });
    }
};

const SchoolsPage = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeMethods = storeCtx.methods;

    const settings = useContext(SettingsContext);

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    const [schoolsDS, searchOptions] = useSearch(storeData.schools, pageText.searchSchool, dgRef);

    // Filter data sources for link columns
    const repLinkDs = useLinkDataSource(storeData.schools, 'representative');
    const linkDsLst = useMemo(() => [repLinkDs], [repLinkDs]);

    const handleRowInserting = useCallback(event => {
        const schoolData = new School(event.data);
        const isCanceled = new Promise(resolve => {
            storeMethods.addSchool(schoolData)
                .then((validationResult) => {
                    for (const linkDs of linkDsLst) {
                        linkDs.add(schoolData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, linkDsLst]);

    const handleRowRemoving = useCallback(event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deleteSchool(event.key)
                .then((validationResult) => {
                    for (const linkDs of linkDsLst) {
                        linkDs.remove(event.data);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, linkDsLst]);

    const handleRowUpdating = useCallback(event => {
        const schoolData = new School({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updateSchool(event.key, schoolData)
                .then((validationResult) => {
                    for (const linkDs of linkDsLst) {
                        linkDs.update(event.oldData, schoolData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, linkDsLst]);

    // Update link data sources after updating plans data source, and log the update
    const handleRowInserted = useCallback(event => {
        console.log('Added school is: ', new School(event.data));
    }, []);

    const handleRowRemoved = useCallback(event => {
        console.log('Removed school is: ', event.data);
    }, []);

    const handleRowUpdated = useCallback(event => {
        const schoolData = new School({...event.oldData, ...event.newData});
        console.log('Updated school is: ', schoolData);
    }, []);

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