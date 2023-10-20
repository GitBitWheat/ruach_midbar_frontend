import { useState, useEffect, useContext, useCallback } from "react";
import { DataGrid, HeaderFilter, Column, ColumnChooser, ColumnFixing, StateStoring, Editing }
    from 'devextreme-react/data-grid';
import { Form, Button } from "react-bootstrap";

import WhatsappCell from "../customcells/whatsappcell/whatsappcell";
import LinkCell from "../customcells/linkcell/linkcell";
import InstructorTypesColumn from "../instructortypescolumn/instructortypescolumn";
import PlanCard from "./plancard/plancard";
import PlanMenu from "../planmenu/planmenu";

import { SchoolsContext } from "../../store/SchoolsContextProvider";
import areas from '../../static/instructor_areas.json';
import { getDistanceRequest, messagesRequest } from "../../utils/localServerRequests";
import { uniques } from "../../utils/arrayUtils";

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './placementspage2text.json';
import './placementspage2.css';



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



const PlacementsPage2 = () => {

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

    // Handlers of instructor placements and unplacements - tables on row click event handlers
    const handlePlacement = useCallback(params => {
        const aip = storeMethods.addInstructorPlacement;
        aip(params.data.id, selectedPlan.id);
    }, [selectedPlan, storeMethods.addInstructorPlacement]);

    const handleUnplacement = useCallback(params => {
        const dip = storeMethods.deleteInstructorPlacement;
        dip(params.data.id, selectedPlan.id);
    }, [selectedPlan, storeMethods.deleteInstructorPlacement]);

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

    const instructorColumns = [
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
        InstructorTypesColumn('instructorTypes', {allowEditing: false}),
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
                    {selectedPlan && <>
                        <Form.Group controlId="formMsgText">
                            <Form.Label>{pageText.msgTextLabel}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={msg}
                                onChange={e => { setMsg(e.target.value) }}
                            />
                        </Form.Group>
                        <div className="flex-row">
                            <Button
                                variant="warning"
                                onClick={() => {
                                    const filteredPlacedInstructors = candidatesDS.filter(cand => cand.action);
                                    messagesRequest(msg, '', '', filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[1]),
                                    filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[0]), '', null,
                                    null, null, () => {});
                
                                    // Updating colors in the database
                                    /*
                                    for (const placedInstructor of candidatesDS) {
                                        if (placedInstructor.action) {
                                            if (placedInstructor.id in instructorToColorId) {
                                                ctxMethods.updateInstructorPlanColor(placedInstructor.id, selectedPlanId, placedColorDefault);
                                            } else {
                                                ctxMethods.addInstructorPlanColor(placedInstructor.id, selectedPlanId, placedColorDefault);
                                            }
                                        }
                                    }
                                    */
                                }}>
                                {pageText.sendMessagesToInstructors}
                            </Button>

                            <Button
                                variant="warning"
                                onClick={updatePlanMsg}>
                                {pageText.saveMsg}
                            </Button>

                            <Button
                                variant="warning"
                                onClick={() => {
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
                                }}
                            >
                                {pageText.placeCandidate}
                            </Button>

                            {pageText.unplacePlanInstructor}
                            <span className="smallGapRow">
                                <Button variant="info" onClick={() => storeMethods.cancelCandidatePlacement(selectedPlan.id, 1)}>
                                    1
                                </Button>
                                <Button variant="info" onClick={() => storeMethods.cancelCandidatePlacement(selectedPlan.id, 2)}>
                                    2
                                </Button>
                                <Button variant="info" onClick={() => storeMethods.cancelCandidatePlacement(selectedPlan.id, 3)}>
                                    3
                                </Button>
                                <Button variant="info" onClick={() => storeMethods.cancelCandidatePlacement(selectedPlan.id, 4)}>
                                    4
                                </Button>
                            </span>
                        </div>
                    </>}
                </div>
            </div>
            <div className="placementsPageRow">
                <div className="placementsTableContainer">
                    <DataGrid
                        dataSource={optionsDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onRowClick={handlePlacement}
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

                        {instructorColumns}
                    </DataGrid>
                </div>
                <div className="placementsTableContainer">
                    <DataGrid
                        dataSource={candidatesDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onRowClick={handleUnplacement}
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
                        {instructorColumns}
                    </DataGrid>
                </div>
            </div>
        </div>
    );
};



export default PlacementsPage2;