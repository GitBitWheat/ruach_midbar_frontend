import { useState, useEffect, useContext, useCallback } from "react";
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
import { uniques } from "../../utils/arrayUtils";

import useColors from "./usecolors";

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './placementspagetext.json';
import './placementspage.css';

/**
 * Calculate the instructor data sources (the options and the placed candidates)
 * @param {Plan} selectedPlan 
 * @param {Array} instructors 
 * @param {Array} instructorPlacements 
 * @returns 
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
            .map(pi => pi.firstName || '')

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
        <div>
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
            <div className="placementsPageRow">
                <div className="placementsTableContainer">
                    <DataGrid
                        dataSource={optionsDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onRowClick={turnToCandidate}
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
                            type='localStorage'
                            storageKey='placementsOptionsDataGridStateStoring'
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
                            type='localStorage'
                            storageKey='placementsCandidatesDataGridStateStoring'
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