import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { DataGrid, HeaderFilter, Column, ColumnChooser, ColumnFixing, StateStoring, Editing }
    from 'devextreme-react/data-grid';
import { Button, TextArea } from "devextreme-react";

import WhatsappCell from "../customcells/whatsappcell/whatsappcell";
import LinkCell from "../customcells/linkcell/linkcell";
import InstructorTypesColumn from "../instructortypescolumn/instructortypescolumn";
import PlanCard from "./plancard/plancard";
import PlanMenu from "../planmenu/planmenu";

import { SchoolsContext } from "../../store/SchoolsContextProvider";
import areas from '../../static/instructor_areas.json';
import { getDistanceRequest, messagesRequest } from "../../utils/localServerRequests";
import { symmDiff, uniques } from "../../utils/arrayUtils";

import useColors from "./usecolors";
import ButtonFilters from "./optionsfilters/buttonfilters";
import useOptionsFilters from "./optionsfilters/useoptionsfilters";

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './placementspagetext.json';
import './placementspage.css';

/**
 * Calculate the instructor data sources (the options and the placed candidates)
 * @param {Plan} selectedPlan 
 * @param {Array} instructors 
 * @param {Array} instructorPlacements 
 */
const calculateDataSources = (selectedPlan, instructors, instructorPlacements) => {
    if (selectedPlan) {
        const newCandidatesDSIds = instructorPlacements
            .filter(placement => placement.planId === selectedPlan.id)
            .map(placement => placement.instructorId);
        
        const newOptionsDS = [];
        const newCandidatesDS = [];

        for (const inst of instructors) {
            if (newCandidatesDSIds.includes(inst.id)) {
                newCandidatesDS.push({...inst, action: false});
            } else {
                newOptionsDS.push({...inst, action: false});
            }
        }

        return [newOptionsDS, newCandidatesDS];

    } else {
        return [[], []];
    }
};

const areasHeaderFilterDS = areas.map(area => ({
    text: area.text,
    value: ['area', 'contains', area.value]
}));

const preparePlan = plan => (
    (({ instructor1, instructor2, instructor3, instructor4, ...rest }) => rest)({
        ...plan,
        instructors: [plan.instructor1, plan.instructor2, plan.instructor3, plan.instructor4]
        .filter(instructor => instructor)
    })
);

// State storing of the data grids - don't save filter values
const noFilterValuesStateHandle = storageKey => [
    state => {
        state.columns
        .forEach(col => { delete col.filterValues; });
        localStorage.setItem(storageKey, JSON.stringify(state));
    }, () => {
        return JSON.parse(localStorage.getItem(storageKey));
    }
];
const optionsStorageKey = 'optionsDataGridStateStoring';
const candidatesStorageKey = 'candidatesDataGridStateStoring';
const [saveOptionsDataGridState, loadOptionsDataGridState] = noFilterValuesStateHandle(optionsStorageKey);
const [saveCandidatesDataGridState, loadCandidatesDataGridState] = noFilterValuesStateHandle(candidatesStorageKey);

/**
 * Update DataGrid filters according to the button filters controls
 * @param {import("react").RefObject} dgRef 
 * @param {Object} btnFltrs 
 * @param {String} dataField 
 */
const updateDGFltrs = (dgRef, btnFltrs, dataField) => {
    if (dgRef && dgRef.current) {
        /** @type {DataGrid} */
        const dg = dgRef.current;
    
        // If the filterValues already match the button filters - do not update them.
        // It is possible the filterValues were updated via the datagrid menu, and as
        // a result this function called was by a useEffect. Prevent an infinite loop.
        const gridFltrExprs = dg.instance.columnOption(dataField, 'filterValues') || [];
        const gridEnabledFltrs =
            (gridFltrExprs.length && !Array.isArray(gridFltrExprs)) ?
            gridFltrExprs[2] : gridFltrExprs.map(fltrExpr => fltrExpr[2]);
        const fltrsCp = {...btnFltrs};
        for (const fltr of gridEnabledFltrs) {
            delete fltrsCp[fltr];
        }
        if (gridEnabledFltrs.every(fltr => btnFltrs[fltr]) &&
            Object.values(fltrsCp).every(active => !active)) {
            return;
        }
    
        const filterValues = Object.entries(btnFltrs)
            .filter(([_value, active]) => active)
            .map(([value, _active]) => [dataField, 'contains', value]);
        dg.instance.columnOption(dataField, 'filterValues', filterValues);
    }
};

/**
 * Update button filters according to the datagrid filterValues
 * @param {import('devextreme/ui/data_grid').OptionChangedEvent} event 
 * @param {Number} colIdx 
 * @param {import('./optionsfilters/buttonfilters').ButtonFiltersControls} btnCtrls 
 */
const updateBtnFltrs = (event, colIdx, btnCtrls) => {
    if (event.fullName === `columns[${colIdx}].filterValues`) {
        let value = event.value || [];
        // If only a single filter has been selected, the filter values
        // array will be its filter expression, instead of a combination
        if (value.length && !Array.isArray(value[0])) {
            value = [value];
        }
        // Turning filter expressions to values
        value = value.map(fltrExpr => fltrExpr[2]);

        btnCtrls.boolSwitch(
            symmDiff(
                value,
                Object.entries(btnCtrls.fltrs)
                .filter(([_value, active]) => active)
                .map(([value, _active]) => value)
            )
        );
    }
};

const PlacementsPage = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const handlePlanChange = useCallback(plan => {
        setSelectedPlanId(plan.id);
    }, []);
    useEffect(() => {
        if (selectedPlanId) {
            const p = storeData.plans.find(p => p.id === selectedPlanId);
            if (p) {
                const school = storeLookupData.schools.get(p.schoolId);
                if (school) {
                    setSelectedPlan({...preparePlan(p), city: school.city});
                } else {
                    setSelectedPlan(preparePlan(p));
                }
            }
        }
    }, [storeLookupData.schools, selectedPlanId, storeData.plans, handlePlanChange]);

    const [optionsDS, setOptionsDS] = useState([]);
    const [candidatesDS, setCandidatesDS] = useState([]);

    // Recalculate the data sources from scratch when the selected plan or list of instructors changes
    useEffect(() => {
        const [newOptionsDS, newCandidatesDS] =
            calculateDataSources(selectedPlan, storeData.instructors, storeData.instructorPlacements);
        setOptionsDS(newOptionsDS);
        setCandidatesDS(newCandidatesDS);
    }, [selectedPlan, storeData.instructors, storeData.instructorPlacements]);

    // Instructor color functionality
    const [candidateColorColCellRender, optionalColorColCellRender,
        candidatesSwitchColorToDefault, optionSwitchColorToDefault, deleteColor] =
        useColors(selectedPlanId, candidatesDS);

    // Handlers of turning instructors to candidates and options - datagrid on row click event handlers
    const turnToCandidate = useCallback(params => {
        const aip = storeMethods.addInstructorPlacement;
        aip(params.data.id, selectedPlan.id);

        // After turning an instructor to a candidate, delete their color
        deleteColor(params.data.id);
    }, [selectedPlan, storeMethods.addInstructorPlacement, deleteColor]);

    const turnToOptional = useCallback(params => {
        const dip = storeMethods.deleteInstructorPlacement;
        dip(params.data.id, selectedPlan.id);

        // After turning an instructor to optional, give them the default option color
        optionSwitchColorToDefault(params.data.id);
    }, [selectedPlan, storeMethods.deleteInstructorPlacement, optionSwitchColorToDefault]);

    // Distances object
    const [dists, setDists] = useState({});
    useEffect(() => {
        (async () => {
            setDists(selectedPlan && selectedPlan.city ?
                await getDistanceRequest(
                    selectedPlan.city,
                    uniques(storeData.instructors.map(inst => inst.city))
                )
            : {});
        })();
    }, [selectedPlan, storeData.instructors]);

    const distCalculateCellValue = useCallback(
        data => (selectedPlan && selectedPlan.city === data.city) ? 0 : (dists[data.city] || null),
        [selectedPlan, dists]
    );

    // Plan message template
    const [msg, setMsg] = useState('');
    useEffect(() => {
        setMsg((selectedPlan && selectedPlan.msg) ? selectedPlan.msg : '');
    }, [selectedPlan]);
    const updatePlanMsg = useCallback(() => {
        storeMethods.updatePlanMessage(selectedPlan.id, msg);
    }, [storeMethods, selectedPlan, msg]);

    /** Selected plan button functionalities */

    const sendMessagesToInstructors = useCallback(_event => {
        const filteredPlacedInstructors = candidatesDS.filter(cand => cand.action);
        messagesRequest(msg, '', '', filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[1]),
        filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[0]), '', null,
        null, null, () => {});
                
        // After sending messages to candidate instructors, switch their color to the default candidate color
        candidatesSwitchColorToDefault();
    }, [msg, candidatesDS, candidatesSwitchColorToDefault]);

    const placeCandidates = useCallback(_event => {
        const instructorsLen = selectedPlan.instructors.length;

        if (instructorsLen >= 4) {
            alert(pageText.planIsFull);
            return;
        }

        const instructorSlotsNum = 4;
        const emptySlotsNum = instructorSlotsNum - instructorsLen;

        const newInstructors = candidatesDS
            .filter(pi => pi.action)
            .map(pi => (pi.firstName || '') + (pi.lastName ? ' ' + pi.lastName : ''))

        if (newInstructors.length > emptySlotsNum) {
            alert(pageText.choseMoreCandidatesThanEmptySlots);
            return;
        }
        else if (newInstructors.length === 0) {
            alert(pageText.noChosenCandidates);
            return;
        }

        storeMethods.placeCandidates(selectedPlan.id, newInstructors, instructorsLen + 1);
    }, [candidatesDS, selectedPlan, storeMethods]);

    const cancelPlacement1 = useCallback(
        _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 1),
        [selectedPlan, storeMethods]
    );
    const cancelPlacement2 = useCallback(
        _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 2),
        [selectedPlan, storeMethods]
    );
    const cancelPlacement3 = useCallback(
        _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 3),
        [selectedPlan, storeMethods]
    );
    const cancelPlacement4 = useCallback(
        _event => storeMethods.cancelCandidatePlacement(selectedPlan.id, 4),
        [selectedPlan, storeMethods]
    );

    /* Button filters for the options table */
    const [areaFltrsCtrls, typeFltrsCtrls] = useOptionsFilters();
    const optionsDataGridRef = useRef();

    useEffect(() => {
        updateDGFltrs(optionsDataGridRef, areaFltrsCtrls.fltrs, 'area');
    }, [areaFltrsCtrls.fltrs, optionsDataGridRef]);

    useEffect(() => {
        updateDGFltrs(optionsDataGridRef, typeFltrsCtrls.fltrs, 'instructorTypes');
    }, [typeFltrsCtrls.fltrs, optionsDataGridRef]);

    // On options datagrid filterValues change, update button controls
    const optionsOptionChangedHandler = useCallback(event => {
        updateBtnFltrs(event, 6, areaFltrsCtrls);
        updateBtnFltrs(event, 9, typeFltrsCtrls);
    }, [areaFltrsCtrls, typeFltrsCtrls]);

    const instructorColumns = () => [
        <Column
            key="dist"
            dataType="number"
            caption={pageText.dist}
            calculateCellValue={distCalculateCellValue}
            allowEditing={false}
            allowFiltering={false}
            sortOrder="asc"
        />,
        <Column
            key="firstName"
            dataField="firstName"
            dataType="string"
            caption={pageText.firstName}
            cellRender={WhatsappCell}
            allowEditing={false}
        />,
        <Column
            key="lastName"
            dataField="lastName"
            dataType="string"
            caption={pageText.lastName}
            allowEditing={false}
        />,
        <Column
            key="cv"
            dataField="cv"
            dataType="string"
            caption={pageText.cvAbbrv}
            cellRender={LinkCell}
            allowEditing={false}
        />,
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
            headerFilter={{ dataSource: areasHeaderFilterDS }}
            allowEditing={false}
        />,
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
            allowEditing={false}
        />,
        InstructorTypesColumn('instructorTypes', { allowEditing: false }),
    ];

    return (
        <div className="placementsPageContainer">
            <div className="placementsPageRow">
                <div id="planCardContainer">
                    <PlanCard planId={(selectedPlan && selectedPlan.id) || null} />
                </div>
                <div>
                    <PlanMenu
                        selectedPlanId={selectedPlan ? selectedPlan.id : null}
                        selectedPlanYear={selectedPlan ? selectedPlan.year : null}
                        selectedPlanStatus={selectedPlan ? selectedPlan.status : null}
                        setNewPlan={handlePlanChange}
                    />
                    <TextArea
                        height={125}
                        value={msg}
                        onChange={e => { setMsg(e.target.value) }}
                        disabled={!(!!selectedPlan)}
                    />
                    <div className="flex-row">
                        <Button
                            text={pageText.sendMessagesToInstructors}
                            icon="bi bi-send"
                            onClick={sendMessagesToInstructors}
                            disabled={!(!!selectedPlan)}
                        />
                        <Button
                            text={pageText.saveMsg}
                            icon="bi bi-floppy"
                            onClick={updatePlanMsg}
                            disabled={!(!!selectedPlan)}
                        />
                        <Button
                            text={pageText.placeCandidates}
                            icon="bi bi-plus-lg"
                            onClick={placeCandidates}
                            disabled={!(!!selectedPlan)}
                        />
                        <span className={selectedPlan ? "" : "dx-state-disabled dx-widget"}>
                            {pageText.unplacePlanInstructor}
                        </span>
                        <span className="smallGapRow">
                            <Button
                                text="1"
                                onClick={cancelPlacement1}
                                disabled={!(!!selectedPlan)}
                            />
                            <Button
                                text="2"
                                onClick={cancelPlacement2}
                                disabled={!(!!selectedPlan)}
                            />
                            <Button
                                text="3"
                                onClick={cancelPlacement3}
                                disabled={!(!!selectedPlan)}
                            />
                            <Button
                                text="4"
                                onClick={cancelPlacement4}
                                disabled={!(!!selectedPlan)}
                            />
                        </span>
                    </div>
                </div>
            </div>

            <ButtonFilters controls={areaFltrsCtrls} />
            <ButtonFilters controls={typeFltrsCtrls} />

            <div className="placementsPageRow">
                <div className="placementsTableContainer">
                    <DataGrid
                        ref={optionsDataGridRef}
                        dataSource={optionsDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onRowClick={turnToCandidate}
                        onOptionChanged={optionsOptionChangedHandler}
                    >
                        <HeaderFilter
                            visible={true}
                            search={{ enabled: true }} 
                            height={settingsConstants.headerFilterHeight}
                        />
                        <ColumnChooser enabled={true} />
                        <ColumnFixing enabled={true} />
                        <StateStoring
                            enabled={true}
                            type='custom'
                            customSave={saveOptionsDataGridState}
                            customLoad={loadOptionsDataGridState}
                        />

                        <Column
                            name="instructorPlanColor"
                            caption={pageText.color}
                            cellRender={optionalColorColCellRender}
                        />
                        {instructorColumns()}
                    </DataGrid>
                </div>
                <div className="placementsTableContainer">
                    <DataGrid
                        dataSource={candidatesDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onRowClick={turnToOptional}
                    >
                        <HeaderFilter
                            visible={true}
                            search={{ enabled: true }}
                            height={settingsConstants.headerFilterHeight}
                        />
                        <ColumnChooser enabled={true} />
                        <ColumnFixing enabled={true} />
                        <StateStoring
                            enabled={true}
                            type='custom'
                            customSave={saveCandidatesDataGridState}
                            customLoad={loadCandidatesDataGridState}
                        />
                        <Editing
                            mode="cell"
                            allowAdding={false}
                            allowDeleting={false}
                            allowUpdating={true}
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
                        {instructorColumns()}
                    </DataGrid>
                </div>
            </div>
        </div>
    );
};

export default PlacementsPage;