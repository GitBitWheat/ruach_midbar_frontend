import React, { useContext, useCallback, useRef } from "react";

import DataGrid, { Column, Editing, Paging, HeaderFilter, MasterDetail,
       Toolbar, Item, ColumnChooser, ColumnFixing, StateStoring }
    from "devextreme-react/data-grid";

import WhatsappCell from "../customcells/whatsappcell/whatsappcell";
import Instructor from "../../store/storeModels/instructor";
import InstructorTypesColumn from "../instructortypescolumn/instructortypescolumn";
import WhatsappEditCell from "../customcells/whatsappcell/whatsappeditcell";
import InstructorFiles from "./instructorfiles";

import useSearch from "../../customhooks/usesearch";
import useClearFiltersButton from "../../customhooks/useclearfiltersbutton/useclearfiltersbutton";
import useSelectBox, { useSelectBoxOptions } from "../../customhooks/useselectbox/useselectbox";

import { SchoolsContext } from '../../store/SchoolsContextProvider'
import settingsConstants from '../../utils/settingsconstants.json';
import { SettingsContext } from "../settingscontext/settingscontext";

import './instructoruploadspage.css';
import pageText from './instructorspagetext.json';
import LinkCell from "../customcells/linkcell/linkcell";
import { uploadInstructorFileToDrive } from "../../utils/localServerRequests";

const InstructorsPage = () => {

    const settings = useContext(SettingsContext);

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeMethods = storeCtx.methods;

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    const handleRowInserting = useCallback(event => {
        const instructor = new Instructor(event.data);
        const isCanceled = new Promise(resolve => {
            storeMethods.addInstructor(instructor)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods]);

    const handleRowRemoving = useCallback(event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deleteInstructor(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods]);

    const handleRowUpdating = useCallback(event => {
        const instructor = new Instructor({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updateInstructor(event.key, instructor)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods]);

    const [searchedInstructorsDS, searchOptions] = useSearch(storeData.instructors, pageText.search, dgRef);

    // Year of plans for placed instructors
    const [dataYear, yearSelectBoxProps] = useSelectBox(storeData.plans, 'year', settings.defaultYear);
    const placedCalculateCellValue = useCallback(
        instructor =>
            dataYear === useSelectBoxOptions.ALL ?
            storeData.plans.some(plan =>
                ([...Array(4).keys()])
                .map(idx => plan[`instructor${idx+1}`])
                .some(placedInstFirstName =>
                    placedInstFirstName && placedInstFirstName.includes(instructor.firstName))
            ) :
            storeData.plans.some(plan =>
                plan.year && plan.year === dataYear &&
                ([...Array(4).keys()])
                .map(idx => plan[`instructor${idx+1}`])
                .some(placedInstFirstName =>
                    placedInstFirstName && placedInstFirstName.includes(instructor.firstName))
            ),
        [storeData.plans, dataYear]
    );

    const fileEditCellComponent = useCallback(({ data }) => {
        const instructor = data.data;
        const instructorDirName =
            data.data.firstName.split('#')[0] + (data.data.lastName ? ' ' + data.data.lastName : '');
        
        return (
            <input
                type="file"
                onChange={event => {
                    if (!(instructor.area && instructor.city && instructor.firstName && instructorDirName)) {
                        alert(pageText.notEnoughParameters);
                        return;
                    }
                    (async () => {
                        const file_metadata = await uploadInstructorFileToDrive(
                            event.target.files[0],
                            instructor.area, instructor.city,
                            instructorDirName,
                            data.column.dataField
                        );
                        if (file_metadata) {
                            data.setValue(`${data.column.caption}#${file_metadata.drive_link}#`);
                        } else {
                            alert(pageText.proposalUploadFailed);
                        }
                    })();
                }}
            />
        );
    }, []);

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
                        component={InstructorFiles}
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
                        editCellComponent={fileEditCellComponent}
                    />
                    <Column
                        dataField="agreement"
                        caption={pageText.agreement}
                        cellRender={LinkCell}
                        editCellComponent={fileEditCellComponent}
                    />
                    <Column
                        dataField="policeApproval"
                        caption={pageText.policeApproval}
                        cellRender={LinkCell}
                        editCellComponent={fileEditCellComponent}
                    />
                    <Column
                        dataField="insurance"
                        caption={pageText.insurance}
                        cellRender={LinkCell}
                        editCellComponent={fileEditCellComponent}
                    />
                    {InstructorTypesColumn()}
                </DataGrid>
            </div>
        </div>
    );
};

export default InstructorsPage;