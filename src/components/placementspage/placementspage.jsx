import { useEffect, useRef } from "react";
import { DataGrid, HeaderFilter, Column, ColumnFixing, StateStoring, Editing, Paging }
    from 'devextreme-react/data-grid';
import { TextArea } from "devextreme-react";
import { Button } from "react-bootstrap";

import WhatsappCell from "../customcells/whatsappcell/whatsappcell";
import LinkCell from "../customcells/linkcell/linkcell";
import InstructorTypesColumn from "../instructortypescolumn/instructortypescolumn";
import PlanCard from "./plancard/plancard";
import PlanMenu from "../planmenu/planmenu";

import useColors from "./hooks/usecolors/usecolors";
import ButtonFilters from "./optionsfilters/buttonfilters";
import useOptionsFilters from "./optionsfilters/useoptionsfilters";
import useLinkDataSource from "../../customhooks/uselinkdatasource";
import usePlanSelect from "./hooks/useplanselect";
import useInstDataSources from "./hooks/useinstdatasources";
import useDists, { updateDGFltrs, updateBtnFltrs } from "./hooks/usedists";
import usePlanMsg from "./hooks/useplanmsg";
import usePlaceCandidates from "./hooks/useplacecandidates";
import useInstToOptionOrCandidate from "./hooks/useinsttooptionorcandidate";
import useHandleInstNotesUpdating from "./hooks/usehandleinstnotesupdating";

import { noFilterValuesStateHandle } from "./misc/nofiltervaluesstatehandle";
import { distColSortingMethod } from "./misc/distcolsortingmethod";
import { movePagerAboveGridOnContentReady } from "./misc/movepagerabovegridoncontentready";
import { dataGridRightOnContentReady } from "../../utils/datagridrightoncontentready";

import areas from '../../static/instructor_areas.json';
import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './placementspagetext.json';
import './placementspage.css';

const areasHeaderFilterDS = areas.map(area => ({
    text: area.text,
    value: ['area', 'contains', area.value]
}));

const [saveOptionsDataGridState, loadOptionsDataGridState] =
    noFilterValuesStateHandle('optionsDataGridStateStoring');
const [saveCandidatesDataGridState, loadCandidatesDataGridState] =
    noFilterValuesStateHandle('candidatesDataGridStateStoring');

const PlacementsPage = () => {

    const [selectedPlan, handlePlanChange] = usePlanSelect();

    const optionsDGRef = useRef(null);
    const candidatesDGRef = useRef(null);

    const [optionsDS, candidatesDS] = useInstDataSources(selectedPlan);

    // Instructor color functionality
    const [candidateColorColCellRender, optionalColorColCellRender,
        candidatesSwitchColorToDefault, optionSwitchColorToDefault, deleteColor] =
        useColors(selectedPlan && selectedPlan.id, candidatesDS);

    // Distances logic
    const [distCalculateCellValue, resortGrids, resortByDistOptionChangedHandler] =
        useDists(selectedPlan, optionsDGRef, candidatesDGRef);

    // Handlers of turning instructors to candidates and options
    const [optionsRowPreparedHandler, candidatesRowPreparedHandler] = useInstToOptionOrCandidate(
        selectedPlan, optionSwitchColorToDefault, deleteColor, resortGrids
    );

    // Messages logic
    const [msg, handleMsgInput, updatePlanMsg, sendMsgToCandidates] = usePlanMsg(selectedPlan, candidatesDS);

    // Selected plan button functionalities
    const sendMsgBtnClickHandler = _event => {
        sendMsgToCandidates();

        // After sending messages to candidate instructors, switch their color to the default candidate color
        candidatesSwitchColorToDefault();
    }

    // Candidate placements logic
    const [placeCandidates, cancelPlacement1, cancelPlacement2, cancelPlacement3, cancelPlacement4] =
        usePlaceCandidates(selectedPlan, candidatesDS);

    // Button filters for the options table
    const [areaFltrsCtrls, typeFltrsCtrls] = useOptionsFilters(
        selectedPlan ? `${selectedPlan.id}_area_fltrs` : null,
        selectedPlan ? `${selectedPlan.id}_type_fltrs` : null
    );

    // Update datagrid filters according to the filter buttons
    useEffect(() => {
        updateDGFltrs(optionsDGRef, areaFltrsCtrls.fltrs, 'area');
    }, [areaFltrsCtrls.fltrs, optionsDGRef]);

    useEffect(() => {
        updateDGFltrs(optionsDGRef, typeFltrsCtrls.fltrs, 'instructorTypes');
    }, [typeFltrsCtrls.fltrs, optionsDGRef]);

    /**
     * On options datagrid filterValues change, update button controls
     * @param {import('devextreme/ui/data_grid').OptionChangedEvent} event 
     */
    const optionsOptionChangedHandler = event => {
        updateBtnFltrs(event, 6, areaFltrsCtrls);
        updateBtnFltrs(event, 9, typeFltrsCtrls);
        resortByDistOptionChangedHandler(event);
    };

    /**
     * Loads the tables on the right side of the horizontal scroll,
     * and moves the pager above the datagrid
     * @param {import('devextreme/ui/data_grid').ContentReadyEvent} event 
     */
    const ContentReadyHandler = event => {
        dataGridRightOnContentReady(event);
        movePagerAboveGridOnContentReady(event);
    };

    // firstName and cv are link values, and the header filter datasources are adjusted accordingly
    const firstNameOptionsHeaderFilterDS = useLinkDataSource(optionsDS, 'firstName');
    const firstNameCandidatesHeaderFilterDS = useLinkDataSource(candidatesDS, 'firstName');
    const cvOptionsHeaderFilterDS = useLinkDataSource(optionsDS, 'cv');
    const cvCandidatesHeaderFilterDS = useLinkDataSource(candidatesDS, 'cv');

    // Instructor notes can be updated in the remote database
    const handleInstNotesUpdating = useHandleInstNotesUpdating();

    const distCol = () => (
        <Column
            key="dist"
            name="dist"
            dataType="number"
            caption={pageText.dist}
            calculateCellValue={distCalculateCellValue}
            allowEditing={false}
            allowFiltering={false}
            allowSorting={true}
            sortOrder="asc"
            sortingMethod={distColSortingMethod}
        />
    );

    const firstNameCol = headerFilterDS => (
        <Column
            key="firstName"
            dataField="firstName"
            dataType="string"
            caption={pageText.firstName}
            cellRender={WhatsappCell}
            allowEditing={false}
        >
            <HeaderFilter dataSource={headerFilterDS}/>
        </Column>
    );

    const lastNameCol = () => (
        <Column
            key="lastName"
            dataField="lastName"
            dataType="string"
            caption={pageText.lastName}
            allowEditing={false}
        />
    );

    const cvCol = headerFilterDS => (
        <Column
            key="cv"
            dataField="cv"
            dataType="string"
            caption={pageText.cvAbbrv}
            cellRender={LinkCell}
            allowEditing={false}
        >
            <HeaderFilter dataSource={headerFilterDS}/>
        </Column>
    );

    const restInstCols = () => [
        <Column
            key="city"
            dataField="city"
            dataType="string"
            caption={pageText.city}
            allowEditing={false}
        />,
        <Column
            key="area"
            dataField="area"
            dataType="string"
            caption={pageText.area}
            allowEditing={false}
        >
            <HeaderFilter dataSource={areasHeaderFilterDS}/>
        </Column>,
        <Column
            key="sector"
            dataField="sector"
            dataType="string"
            caption={pageText.sector}
            allowEditing={false}
        />,
        <Column
            key="notes"
            dataField="notes"
            dataType="string"
            caption={pageText.notes}
            allowEditing={true}
        />,
        InstructorTypesColumn('instructorTypes', { allowEditing: false }),
    ];

    return (
        <div className="placementsPageContainer">
            <div className="placementsPageRow">
                <div id="filterButtonsContainer">
                    <ButtonFilters controls={areaFltrsCtrls} />
                    <ButtonFilters controls={typeFltrsCtrls} />
                </div>
                <div id="planCardContainer">
                    <PlanCard planId={(selectedPlan && selectedPlan.id) || null} />
                </div>
                <div>
                    <TextArea
                        height={200}
                        width={300}
                        value={msg}
                        onInput={handleMsgInput}
                        disabled={!(!!selectedPlan)}
                    />
                </div>
            </div>
            <div className="flex-row">
                <PlanMenu
                    selectedPlanId={selectedPlan ? selectedPlan.id : null}
                    selectedPlanYear={selectedPlan ? selectedPlan.year : null}
                    selectedPlanStatus={selectedPlan ? selectedPlan.status : null}
                    setNewPlan={handlePlanChange}
                />
                <div className="flex-row">
                    <Button
                        variant="warning"
                        onClick={sendMsgBtnClickHandler}
                        disabled={!(!!selectedPlan)}
                    >
                        {pageText.sendMessagesToInstructors}
                    </Button>
                    <Button
                        variant="warning"
                        onClick={updatePlanMsg}
                        disabled={!(!!selectedPlan)}
                    >
                        {pageText.saveMsg}
                    </Button>
                    <Button
                        variant="warning"
                        onClick={placeCandidates}
                        disabled={!(!!selectedPlan)}
                    >
                        {pageText.placeCandidates}
                    </Button>
                    <span className={selectedPlan ? "" : "dx-state-disabled dx-widget"}>
                        {pageText.unplacePlanInstructor}
                    </span>
                    <span className="smallGapRow">
                        <Button
                            variant="info"
                            onClick={cancelPlacement1}
                            disabled={!(!!selectedPlan)}
                        >
                            1
                        </Button>
                        <Button
                            variant="info"
                            onClick={cancelPlacement2}
                            disabled={!(!!selectedPlan)}
                        >
                            2
                        </Button>
                        <Button
                            variant="info"
                            onClick={cancelPlacement3}
                            disabled={!(!!selectedPlan)}
                        >
                            3
                        </Button>
                        <Button
                            variant="info"
                            onClick={cancelPlacement4}
                            disabled={!(!!selectedPlan)}
                        >
                            4
                        </Button>
                    </span>
                </div>
            </div>

            <div className="placementsPageRow">
                <div className="placementsTableContainer">
                    <DataGrid
                        ref={optionsDGRef}
                        dataSource={optionsDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onRowPrepared={optionsRowPreparedHandler}
                        onOptionChanged={optionsOptionChangedHandler}
                        onContentReady={ContentReadyHandler}
                        onRowUpdating={handleInstNotesUpdating}
                    >
                        <HeaderFilter
                            visible={true}
                            search={{ enabled: true }} 
                            height={settingsConstants.headerFilterHeight}
                        />
                        <ColumnFixing enabled={true} />
                        <StateStoring
                            enabled={true}
                            type='custom'
                            customSave={saveOptionsDataGridState}
                            customLoad={loadOptionsDataGridState}
                        />
                        <Editing
                            mode='cell'
                            allowAdding={false}
                            allowDeleting={false}
                            allowUpdating={true}
                        />
                        <Paging
                            enabled={true}
                            pageSize={settingsConstants.dataGridRowsPageSize}
                            defaultPageIndex={0}
                        />

                        <Column
                            name="instructorPlanColor"
                            caption={pageText.color}
                            cellRender={optionalColorColCellRender}
                        />
                        {distCol()}
                        {firstNameCol(firstNameOptionsHeaderFilterDS.dataSource)}
                        {lastNameCol()}
                        {cvCol(cvOptionsHeaderFilterDS.dataSource)}
                        {restInstCols()}
                    </DataGrid>
                </div>
                <div className="placementsTableContainer">
                    <DataGrid
                        ref={candidatesDGRef}
                        dataSource={candidatesDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onRowPrepared={candidatesRowPreparedHandler}
                        onContentReady={ContentReadyHandler}
                        onRowUpdating={handleInstNotesUpdating}
                    >
                        <HeaderFilter
                            visible={true}
                            search={{ enabled: true }}
                            height={settingsConstants.headerFilterHeight}
                        />
                        <ColumnFixing enabled={true} />
                        <StateStoring
                            enabled={true}
                            type='custom'
                            customSave={saveCandidatesDataGridState}
                            customLoad={loadCandidatesDataGridState}
                        />
                        <Editing
                            mode='cell'
                            allowAdding={false}
                            allowDeleting={false}
                            allowUpdating={true}
                        />
                        <Paging
                            enabled={true}
                            pageSize={settingsConstants.dataGridRowsPageSize}
                            defaultPageIndex={0}
                        />

                        <Column
                            caption={pageText.action}
                            dataField="action"
                            dataType="boolean"
                            allowSorting={false}
                            allowFiltering={false}
                        />
                        <Column
                            name="instructorPlanColor"
                            caption={pageText.color}
                            cellRender={candidateColorColCellRender}
                        />
                        {distCol()}
                        {firstNameCol(firstNameCandidatesHeaderFilterDS.dataSource)}
                        {lastNameCol()}
                        {cvCol(cvCandidatesHeaderFilterDS.dataSource)}
                        {restInstCols()}
                    </DataGrid>
                </div>
            </div>
        </div>
    );
};

export default PlacementsPage;