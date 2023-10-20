import { useState, useEffect, useContext, useCallback } from 'react';

import { Container } from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import Circle from '@uiw/react-color-circle';

import DataTable from '../datatable/datatable';
import ButtonList from '../buttonlist/buttonlist';
import PlanMenu from '../planmenu/planmenu';
import PlanCard from '../plancard/plancard';

import areaButtonDescs from '../../static/instructor_area_buttons.json'
import instructorTypeButtonDescs from '../../static/instructor_type_buttons.json'
import pageText from './placementspage-text.json'
import './placementspage.css'

import { SchoolsContext } from '../../store/SchoolsContextProvider'

import { messagesRequest } from '../../utils/localServerRequests';
import { getDistance } from "../../mapping/distances"



const instructorColumns = [
    {field: "coloredStatus", header: ""},
    {field: "firstName", header: "פרטי"},
    {field: "lastName", header: "משפחה"},
    {field: "cv", header: "קוח"},
    {field: "city", header: "יישוב"},
    {field: "area", header: "אזור"},
    {field: "sector", header: "מגזר"},
    {field: "notes", header: "הערות"},
    {field: "instructorTypes", header: "תחומים"},
    {field: "distance", header: "מרחק"},
];

const instructorTablesColWidths = {
    "coloredStatus": 2,
    "firstName": 4,
    "lastName": 4,
    "cv": 2.5,
    "city": 3,
    "area": 3,
    "sector": 3,
    "notes": 10,
    "instructorTypes": 5,
    "distance": 2
};

const instructorTablesCustomColSort = {
    distance: (inst1, inst2) => {
        if (inst1.distance === -1) {
            return 1;
        } else if (inst2.distance === -1) {
            return -1;
        } else {
            return inst1.distance > inst2.distance ? 1 : -1;
        }
    }
};





const placedInstructorColumns = [...instructorColumns];
placedInstructorColumns.unshift({field: "shouldAction", header: ""});

const whiteHex = '#ffffff';



const PlacementsPage = () => {

    const schoolsCtx = useContext(SchoolsContext);
    const ctxData = schoolsCtx.data;
    const ctxMethods = schoolsCtx.methods;



    const [selectedPlanId, setSelectedPlanId] = useState(null);

    let selectedPlan = ctxData.plans.find(plan => plan.id === selectedPlanId);
    if (selectedPlan === null || selectedPlan === undefined) {
        selectedPlan = {
            institution: '',
            city: '',
            plan: '',
            days: '',
            instructor1: '',
            instructor2: '',
            instructor3: '',
            instructor4: '',
            contact: '',
            details: '',
            msg: '',
            year: '',
            status: '',
			grade: 0,
			weeks: ''
        }
    };



    const findDefaultSelectedButtons = useCallback(selectedPlanId => {
        if (selectedPlanId !== undefined && selectedPlanId !== null) {
            const selectedPlanDefaultButtons = ctxData.planButtons.filter(pb => pb.planId === selectedPlanId).map(pb => pb.button);
            return [Object.fromEntries(areaButtonDescs.map(abd => [abd.value, selectedPlanDefaultButtons.includes(abd.value)])),
                    Object.fromEntries(instructorTypeButtonDescs.map(abd => [abd.value, selectedPlanDefaultButtons.includes(abd.value)]))];
        } else {
            return [Object.fromEntries(areaButtonDescs.map(abd => [abd.value, false])),
                    Object.fromEntries(instructorTypeButtonDescs.map(abd => [abd.value, false]))];
        }
    }, [ctxData.planButtons]);

    const [selectedAreasTmp, selectedInstructorTypesTmp] = findDefaultSelectedButtons(selectedPlanId);

    // Lists of selected area and type for the instructor query
    const [selectedAreas, setSelectedAreas] = useState(selectedAreasTmp);
    const [selectedInstructorTypes, setSelectedInstructorTypes] = useState(selectedInstructorTypesTmp);

    const setSelectorsChange = (state, setState) => key => {setState({...state, [key]: !state[key]})};
    const setAreaChange = setSelectorsChange(selectedAreas, setSelectedAreas);
    const setTypeChange = setSelectorsChange(selectedInstructorTypes, setSelectedInstructorTypes);



    const [selectedInstructors, setSelectedInstructors] = useState([]);
    const [placingMode, setPlacingMode] = useState(true);

    // The message sent to the placed instructors
    const [msg, setMsg] = useState(selectedPlan.msg !== null ? selectedPlan.msg : '');

    // The instructors placed in the plan and shown in the placed instructors table
    const findPlacedInstructors = useCallback(selectedPlanId => {
        return selectedPlanId === null ? [] : 

        // The placed instructors should appear in the instructor placements table, with the id of the selected plan referenced
        ctxData.instructors.filter(instructor => ctxData.instructorPlacements.some(placement =>
            placement.planId === selectedPlanId && placement.instructorId === instructor.id))

            // If an instructor is already placed, don't change it.
            // Otherwise, add that it is unchecked for sending messages.
            .map(instructor => {
                const instructorCopy = {...instructor};
                instructorCopy.shouldAction = false;
                return instructorCopy;
            })
    }, [ctxData.instructors, ctxData.instructorPlacements]);
    const [placedInstructors, setPlacedInstructors] = useState(findPlacedInstructors(selectedPlanId));



    // Map from instructor to color according to the selected plan
    const [instructorToColorId, setInstructorToColorId] = useState({});

    useEffect(() => {
        setInstructorToColorId(Object.fromEntries(ctxData.instructorPlanColors
            .filter(ipColor => ipColor.planId === selectedPlanId)
            .map(ipColor => [ipColor.instructorId, ipColor.colorId])));
    }, [ctxData.instructorPlanColors, selectedPlanId]);

    const instructorToColorHex = useCallback(instructorId => instructorId in instructorToColorId ?
        ctxData.colors.find(color => color.id === instructorToColorId[instructorId]).hex : whiteHex,
    [ctxData.colors, instructorToColorId]);
    
    
    
    // Map each color id to the next
    const [placedColorIds, setPlacedColorIds] = useState(new Map());
    const [unplacedColorIds, setUnplacedColorIds] = useState(new Map());
    
    // Default color for placed and unplanced instructors
    const [placedColorDefault, setPlacedColorDedault] = useState(null);
    const [unplacedColorDefault, setUnplacedColorDedault] = useState(null);

    useEffect(() => {
        const placedColorIdMap = new Map();
        const unplacedColorIdMap = new Map();
        let lastPlacedColorId = -1;
        let lastUnplacedColorId = -1;

        for (const color of ctxData.colors) {
            if (color.forPlaced) {
                placedColorIdMap.set(lastPlacedColorId, color.id);
                lastPlacedColorId = color.id;

                if (color.default) {
                    setPlacedColorDedault(color.id);
                }
            }
            else {
                unplacedColorIdMap.set(lastUnplacedColorId, color.id);
                lastUnplacedColorId = color.id;

                if (color.default) {
                    setUnplacedColorDedault(color.id);
                }
            }
        }

        placedColorIdMap.set(lastPlacedColorId, -1);
        unplacedColorIdMap.set(lastUnplacedColorId, -1);

        setPlacedColorIds(placedColorIdMap);
        setUnplacedColorIds(unplacedColorIdMap);
    }, [ctxData.colors]);



    //Select instructors from based on the query buttons (area and type) and if it is not already placed
    useEffect(() => {
        (async () => {
            let si = ctxData.instructors

            // Filtering instructors based on the area and instructor type of the query
            .filter(instructor => selectedAreas[instructor.area] && instructor.instructorTypes.some(type => selectedInstructorTypes[type]))

            // Filtering instructors that are already placed in the selected plan
            // Somewhat unefficient implementation, but it works fine
            .filter(instructor => selectedPlanId !== null && selectedPlanId !== undefined
                ? ctxData.instructorPlacements.every(placement => placement.instructorId !== instructor.id || placement.planId !== selectedPlanId) : true);
            
            const dists = await getDistance(selectedPlan.city, si.map(inst => inst.city));
            si = si.map((inst, idx) =>
                ({...inst, distance: inst.city === selectedPlan.city ? 0 : dists[idx]})
            );

            setSelectedInstructors(si);
        })();
    }, [ctxData.instructors, ctxData.instructorPlacements, selectedPlanId, selectedAreas, selectedInstructorTypes, selectedPlan.city]);
    


    // The notes field can be updated through the instructor tables
    const instructorTablesInputFields = {
        "notes": instructor => input => ctxMethods.updateInstructorNotes(instructor.id, input)
    };



    // Custom displays of the instructor tables: The colored status is displayed as a colored circle, and its color
    // can be changed when clicked, while the instructor types are concatenated into one string
    const colorCircle = nextColorMap => row => selectedPlanId === null ? null : (
        <div className="statusCircle">
            <Circle
                colors={[instructorToColorHex(row.id)]}
                onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    const hasColor = row.id in instructorToColorId;
                    const newColorId = nextColorMap.get(hasColor ? instructorToColorId[row.id] : -1);
                    if (!hasColor) {
                        if (newColorId !== -1) {
                            ctxMethods.addInstructorPlanColor(row.id, selectedPlanId, newColorId);
                        }
                    }
                    else if (newColorId !== -1) {
                        ctxMethods.updateInstructorPlanColor(row.id, selectedPlanId, newColorId);
                    }
                    else {
                        ctxMethods.deleteInstructorPlanColor(row.id, selectedPlanId);
                    }
                }}
            />
        </div>
    );

    const instructorTablesCustomColDisplay = {
        coloredStatus: colorCircle(unplacedColorIds),
        instructorTypes: row => row['instructorTypes'].join(', '),
        distance: inst => inst.distance === -1 ? '' : inst.distance
    };



    // In the placed instructors table, each instructor can be checked for sending a message
    const placedInstructorTablesCustomColDisplay = {
        ...instructorTablesCustomColDisplay,
        coloredStatus: colorCircle(placedColorIds),
        shouldAction: placedInstructorRow => (
            <Form>
                <Form.Check
                    onClick={e => {

                        // Preventing the onclick action of the row (canceling instructor placement)
                        e.preventDefault();
                        e.stopPropagation();
                    }}

                    onChange={() => {

                        // Check/uncheck the message send flag of the placed instructor
                        setPlacedInstructors(placedInstructors.map(instructor => {
                            if (instructor.id === placedInstructorRow.id) {
                                const instructorCopy = {...instructor};
                                instructorCopy.shouldAction = !instructorCopy.shouldAction;
                                return instructorCopy;
                            }
                            else {
                                return instructor;
                            }
                        }))
                    }}

                    checked={placedInstructorRow.shouldAction}
                />
            </Form>
        )
    };



    const [placedInstructorsDists, setPlacedInstructorsDists] = useState([]);
    useEffect(() => {
        (async () => {
            setPlacedInstructorsDists(await getDistance(selectedPlan.city, placedInstructors.map(inst => inst.city)));
        })();
    }, [placedInstructors, selectedPlan.city]);



    return (
        <Container fluid className="instructorsPageContainer">
            <Row>
                <Col xs={8}>
                    <Row>
                        <ButtonList
                            buttonDescs={areaButtonDescs.map(buttonDesc => ({...buttonDesc, onclick: () => {
                                if (selectedPlanId !== undefined && selectedPlanId !== null) {
                                    if (selectedAreas[buttonDesc.value]) {
                                        ctxMethods.deletePlanButtons(selectedPlanId, [buttonDesc.value]);
                                    } else {
                                        ctxMethods.addPlanButtons(selectedPlanId, [buttonDesc.value]);
                                    }
                                }
                                setAreaChange(buttonDesc.value);
                            }}))}
                            checkAll={() => {
                                if (selectedPlanId !== undefined && selectedPlanId !== null) {
                                    ctxMethods.addPlanButtons(selectedPlanId, Object.keys(selectedAreas).filter(value => !selectedAreas[value]));
                                }
                                setSelectedAreas(Object.fromEntries(Object.entries(selectedAreas).map(([area, _]) => [area, true])));
                            }}
                            uncheckAll={() => {
                                if (selectedPlanId !== undefined && selectedPlanId !== null) {
                                    ctxMethods.deletePlanButtons(selectedPlanId, Object.keys(selectedAreas).filter(value => selectedAreas[value]));
                                }
                                setSelectedAreas(Object.fromEntries(Object.entries(selectedAreas).map(([area, _]) => [area, false])));
                            }}
                            checkedByDefault={selectedAreas}
                        />
                    </Row>
                    <Row>
                        <ButtonList
                            buttonDescs={instructorTypeButtonDescs.map(buttonDesc => ({...buttonDesc, onclick: () => {
                                if (selectedPlanId !== undefined && selectedPlanId !== null) {
                                    if (selectedInstructorTypes[buttonDesc.value]) {
                                        ctxMethods.deletePlanButtons(selectedPlanId, [buttonDesc.value]);
                                    } else {
                                        ctxMethods.addPlanButtons(selectedPlanId, [buttonDesc.value]);
                                    }
                                }
                                setTypeChange(buttonDesc.value);
                            }}))}
                            checkAll={() => {
                                if (selectedPlanId !== undefined && selectedPlanId !== null) {
                                    ctxMethods.addPlanButtons(selectedPlanId, Object.keys(selectedInstructorTypes).filter(value => !selectedInstructorTypes[value]));
                                }
                                setSelectedInstructorTypes(Object.fromEntries(Object.entries(selectedInstructorTypes).map(([type, _]) => [type, true])));
                            }}
                            uncheckAll={() => {
                                if (selectedPlanId !== undefined && selectedPlanId !== null) {
                                    ctxMethods.deletePlanButtons(selectedPlanId, Object.keys(selectedInstructorTypes).filter(value => selectedInstructorTypes[value]));
                                }
                                setSelectedInstructorTypes(Object.fromEntries(Object.entries(selectedInstructorTypes).map(([type, _]) => [type, false])));
                            }}
                            checkedByDefault={selectedInstructorTypes}
                        />
                    </Row>
                </Col>
                <Col xs={2}>
                    <PlanCard
                        institution={selectedPlan.institution}
                        city={selectedPlan.city}
                        plan={selectedPlan.plan}
                        days={selectedPlan.days}
                        instructors={[selectedPlan.instructor1, selectedPlan.instructor2, selectedPlan.instructor3, selectedPlan.instructor4]
                            .filter(instructor => instructor !== null && instructor !== '')}
                        contact={selectedPlan.contact}
                        details={selectedPlan.details}
						grade={selectedPlan.grade}
						weeks={selectedPlan.weeks}
                    />
                </Col>
                <Col xs={2}>
                    <Form.Group controlId="formMsgText">
                        <Form.Label>{pageText.msgTextLabel}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={msg}
                            onChange={e => { setMsg(e.target.value) }}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col className="rightToLeftRow">
                    <PlanMenu
                        selectedPlanId={selectedPlanId}
                        selectedPlanYear={selectedPlan.year}
                        selectedPlanStatus={selectedPlan.status}
                        setNewPlan={plan => {
                            setSelectedPlanId(plan.id);
                            setMsg(plan.msg ? plan.msg : '');
                            setPlacedInstructors(findPlacedInstructors(plan.id));

                            const [selectedAreasTmp, selectedInstructorTypesTmp] = findDefaultSelectedButtons(plan.id);
                            setSelectedAreas(selectedAreasTmp);
                            setSelectedInstructorTypes(selectedInstructorTypesTmp);
                        }}
                    />
                </Col>
                <Col className="rightToLeftRow">
                    <Button
                        variant="warning"
                        onClick={() => {
                            const filteredPlacedInstructors = placedInstructors.filter(placedInstructor => placedInstructor.shouldAction);
                            messagesRequest(msg, '', '', filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[1]),
                            filteredPlacedInstructors.map(placedInstructor => placedInstructor.firstName.split('#')[0]), '', null,
                            null, null, () => {});
                
                            // Updating colors in the database
                            for (const placedInstructor of placedInstructors) {
                                if (placedInstructor.shouldAction) {
                                    if (placedInstructor.id in instructorToColorId) {
                                        ctxMethods.updateInstructorPlanColor(placedInstructor.id, selectedPlanId, placedColorDefault);
                                    } else {
                                        ctxMethods.addInstructorPlanColor(placedInstructor.id, selectedPlanId, placedColorDefault);
                                    }
                                }
                            }
                        }}>
                        {pageText.sendMessagesToInstructors}
                    </Button>

                    <Button
                        variant="warning"
                        onClick={() => {
                            ctxMethods.updatePlanMessage(selectedPlanId, msg);
                        }}>
                        {pageText.saveMsg}
                    </Button>

                    <Button
                        variant="warning"
                        onClick={() => {
                            if (selectedPlanId === null) {
                                alert(pageText.noSelectedPlanForCandidates);
                                return;
                            }
                            let instructorNum = 1;
                            let full = true;

                            for (; instructorNum <= 4; ++instructorNum) {
                                if (selectedPlan[`instructor${instructorNum}`] === null || selectedPlan[`instructor${instructorNum}`] === '') {
                                    full = false;
                                    break;
                                }
                            }

                            if (full) {
                                alert(pageText.planIsFull);
                                return;
                            }

                            const instructorSlotsNum = 4;
                            const emptySlotsNum = instructorSlotsNum - instructorNum + 1;

                            const newInstructors = placedInstructors
                                .filter(pi => pi.shouldAction)
                                .map(pi => pi.firstName || '')
                            
                            if (newInstructors.length > emptySlotsNum) {
                                alert(pageText.choseMoreCandidatesThanEmptySlots);
                                return;
                            }
                            else if (newInstructors.length === 0) {
                                alert(pageText.noChosenCandidates);
                                return;
                            }

                            ctxMethods.placeCandidates(selectedPlanId, newInstructors, instructorNum);
                        }}
                    >
                        {pageText.placeCandidate}
                    </Button>

                    {pageText.unplacePlanInstructor}
                    <span className="smallGapRow">
                        <Button variant="info" onClick={() => ctxMethods.cancelCandidatePlacement(selectedPlanId, 1)}>
                            1
                        </Button>
                        <Button variant="info" onClick={() => ctxMethods.cancelCandidatePlacement(selectedPlanId, 2)}>
                            2
                        </Button>
                        <Button variant="info" onClick={() => ctxMethods.cancelCandidatePlacement(selectedPlanId, 3)}>
                            3
                        </Button>
                        <Button variant="info" onClick={() => ctxMethods.cancelCandidatePlacement(selectedPlanId, 4)}>
                            4
                        </Button>
                    </span>
                </Col>
            </Row>
            <Row>
                <Col className="rightToLeftRow">
                    <h4 style={{textAlign: 'right'}}>{pageText.instructorList}</h4>
                    {
                        // Switch for placing mode. Show only if a plan has been selected
                        selectedPlanId !== null && selectedPlanId !== undefined ?
                        (
                                <Form>
                                    <Form.Check className="rtlFormSwitch"
                                        type="switch"
                                        label={pageText.placingMode}
                                        onClick={() => setPlacingMode(!placingMode)}
                                        defaultChecked={true}
                                    />
                                </Form>
                        )
                        :
                        (<p className="noSelectedPlan">{pageText.noSelectedPlan}</p>)
                    }
                    <a target="_blank" rel="noreferrer" href='https://www.google.com/maps'>{pageText.googleMaps}</a>
                </Col>
                <Col>
                    <h4>מועמדים לתוכנית</h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <DataTable
                        name="selectedInstructors-datatable"
                        columns={instructorColumns}
                        rows={selectedInstructors}
                        customColDisplay={instructorTablesCustomColDisplay}
                        customColSort={instructorTablesCustomColSort}
                        defaultSortedCol={'distance'}
                        linkCols = {['firstName', 'lastName', 'cv']}
                        onClickRowField={
                            // If a plan has been selected, clicking on an instructor row places it in the plan
                            // Placing mode must be set to true
                            placingMode && selectedPlanId !== null && selectedPlanId !== undefined ?
                            { sector: instructor => {
                                // Update the placed instructors state of this component
                                const placedInstructorsCopy = [...placedInstructors];
                                const instructorCopy = {...instructor};
                                instructorCopy.shouldAction = false;
                                placedInstructorsCopy.push(instructorCopy);
                                setPlacedInstructors(placedInstructorsCopy);

                                // Update the instructor data in the database
                                ctxMethods.addInstructorPlacement(instructor.id, selectedPlanId);
                                ctxMethods.deleteInstructorPlanColor(instructor.id, selectedPlanId);
                            } }
                            : null
                        }
                        inputFields={instructorTablesInputFields}
                        colWidthWeights={instructorTablesColWidths}
                    />
                </Col>
                <Col>
                    <DataTable
                        name="placedInstructors-datatable"
                        columns={placedInstructorColumns}
                        rows={placedInstructors.map((inst, idx) => ({...inst, distance: inst.city === selectedPlan.city ? 0 :
                            (idx < placedInstructorsDists.length ? placedInstructorsDists[idx] : -1)}))}
                        customColDisplay={placedInstructorTablesCustomColDisplay}
                        customColSort={instructorTablesCustomColSort}
                        defaultSortedCol={'distance'}
                        linkCols={['firstName', 'lastName', 'cv']}
                        onClickRowField={
                            //If a plan has been selected, clicking on an instructor row canceling its placement it in the plan
                            // Placing mode must be set to true
                            placingMode && selectedPlanId !== null && selectedPlanId !== undefined ?
                            { sector: instructor => {
                                
                                // Update the instructor data in the database
                                ctxMethods.deleteInstructorPlacement(instructor.id, selectedPlanId);

                                if (instructor.id in instructorToColorId) {
                                    ctxMethods.updateInstructorPlanColor(instructor.id, selectedPlanId, unplacedColorDefault);
                                } else {
                                    ctxMethods.addInstructorPlanColor(instructor.id, selectedPlanId, unplacedColorDefault);
                                }

                                // Update the placed instructors state of this component
                                const placedInstructorsCopy = [...placedInstructors];
                                const instructorIdx = placedInstructorsCopy.findIndex(placedInstructor => placedInstructor.id === instructor.id)
                                placedInstructorsCopy.splice(instructorIdx, 1);
                                setPlacedInstructors(placedInstructorsCopy);
                            } }
                            : null
                        }
                        inputFields={instructorTablesInputFields}
                        colWidthWeights={{
                            "shouldAction": 1,
                            ...instructorTablesColWidths
                        }}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default PlacementsPage;