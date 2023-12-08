import React, { useContext, useRef } from "react";

import DataGrid, { Column, Editing, Paging, HeaderFilter, MasterDetail,
       Toolbar, Item, ColumnChooser, ColumnFixing, StateStoring }
    from "devextreme-react/data-grid";

import WhatsappCell from "../customcells/whatsappcell/whatsappcell";
import InstructorTypesColumn from "../instructortypescolumn/instructortypescolumn";
import WhatsappEditCell from "../customcells/whatsappcell/whatsappeditcell";
import FileEditCellComponent from "./misc/FileEditCellComponent";
import InstructorDirs from "./instructordirs/instructordirs";

import useSearch from "../../customhooks/usesearch";
import useClearFiltersButton from "../../customhooks/useclearfiltersbutton/useclearfiltersbutton";
import usePlacedInstsByYear from "./hooks/useplacesinstsbyyear";

import { StoreContext } from '../../store/StoreContextProvider'
import settingsConstants from '../../utils/settingsconstants.json';
import { SettingsContext } from "../settingscontext/settingscontext";

import './instructoruploadspage.css';
import pageText from './instructorspagetext.json';
import LinkCell from "../customcells/linkcell/linkcell";
import useHandleCurrentRowAction from "./hooks/usehandlecurrentrowaction";

const InstructorsPage = () => {

    const settings = useContext(SettingsContext);

    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    const [handleRowInserting, handleRowRemoving, handleRowUpdating] = useHandleCurrentRowAction();
    const [searchedInstructorsDS, searchOptions] = useSearch(storeData.instructors, pageText.search, dgRef);
    const [yearSelectBoxProps, placedCalculateCellValue] = usePlacedInstsByYear();

    return (
        <div>
            <div id="data-grid-demo">
                <DataGrid
                    ref={dgRef}
                    dataSource={searchedInstructorsDS}
                    keyExpr="id"
                    onRowInserting={handleRowInserting}
                    onRowRemoving={handleRowRemoving}
                    onRowUpdating={handleRowUpdating}
                >
                    <Paging
                        enabled={true}
                        pageSize={30}
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
                        storageKey='instructorsDataGridStateStoring'
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
                        <Item
                            widget='dxSelectBox'
                            options={yearSelectBoxProps}
                        />
                    </Toolbar>
                    <MasterDetail
                        enabled={true}
                        component={InstructorDirs}
                    />

                    <Column
                        dataField="firstName"
                        caption={pageText.firstName}
                        cellRender={WhatsappCell}
                        editCellComponent={WhatsappEditCell}
                    />
                    <Column
                        dataField="lastName"
                        caption={pageText.lastName}
                    />
                    <Column
                        name='placed'
                        dataType='boolean'
                        caption={pageText.placed}
                        calculateCellValue={placedCalculateCellValue}
                        allowEditing={false}
                        allowFiltering={true}
                    />
                    <Column
                        dataField="city"
                        caption={pageText.city}
                    />
                    <Column
                        dataField="area"
                        caption={pageText.area}
                    />
                    <Column
                        dataField="sector"
                        caption={pageText.sector}
                    />
                    <Column
                        dataField="notes"
                        caption={pageText.notes}
                    />
                    <Column
                        dataField="cv"
                        caption={pageText.cv}
                        cellRender={LinkCell}
                        editCellComponent={FileEditCellComponent}
                    />
                    <Column
                        dataField="agreement"
                        caption={pageText.agreement}
                        cellRender={LinkCell}
                        editCellComponent={FileEditCellComponent}
                    />
                    <Column
                        dataField="policeApproval"
                        caption={pageText.policeApproval}
                        cellRender={LinkCell}
                        editCellComponent={FileEditCellComponent}
                    />
                    <Column
                        dataField="insurance"
                        caption={pageText.insurance}
                        cellRender={LinkCell}
                        editCellComponent={FileEditCellComponent}
                    />
                    {InstructorTypesColumn()}
                </DataGrid>
            </div>
        </div>
    );
};

export default InstructorsPage;