import { useState, useEffect, useContext, useCallback } from "react";
import { DataGrid, HeaderFilter, Column, ColumnChooser, ColumnFixing, StateStoring }
    from 'devextreme-react/data-grid';

import WhatsappCell from "../customcells/whatsappcell/whatsappcell";
import LinkCell from "../customcells/linkcell/linkcell";
import InstructorTypesColumn from "../instructortypescolumn/instructortypescolumn";
import PlanCard from "./plancard/plancard";
import PlanMenu from "../planmenu/planmenu";

import { SchoolsContext } from "../../store/SchoolsContextProvider";
import areas from '../../static/instructor_areas.json';
import { getDistanceRequest } from "../../utils/localServerRequests";
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
                newCandidatesDS.push(inst);
            } else {
                newOptionsDS.push(inst);
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
    const handlePlanChange = plan => {
        const school = storeLookupData.schools.get(plan.schoolId);
        if (school) {
            setSelectedPlan({...preparePlan(plan), city: school.city});
        } else {
            setSelectedPlan(preparePlan(plan));
        }
    };

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
        data => selectedPlan.city === data.city ? 0 : (dists[data.city] || null),
        [selectedPlan, dists]
    );
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
        />,
        <Column
            key="lastName"
            dataField="lastName"
            dataType="string"
            caption={pageText.lastName}
        />,
        <Column
            key="cv"
            dataField="cv"
            dataType="string"
            caption={pageText.cvAbbrv}
            cellRender={LinkCell}
        />,
        <Column
            key="city"
            dataField="city"
            dataType="string"
            caption={pageText.city}
        />,
        <Column
            key="area"
            dataField="area"
            dataType="string"
            caption={pageText.area}
            headerFilter={{ dataSource: areasHeaderFilterDS }}
        />,
        <Column
            key="sector"
            dataField="sector"
            dataType="string"
            caption={pageText.sector}
        />,
        <Column
            key="notes"
            dataField="notes"
            dataType="string"
            caption={pageText.notes}
        />,
        InstructorTypesColumn('instructorTypes'),
    ];



    return (
        <div>
            <div className="placementsPageRow">
                <div id="planCardContainer">
                    <PlanCard plan={selectedPlan} />
                </div>
                <div>
                    <PlanMenu
                        selectedPlanId={selectedPlan ? selectedPlan.id : null}
                        selectedPlanYear={selectedPlan ? selectedPlan.year : null}
                        selectedPlanStatus={selectedPlan ? selectedPlan.status : null}
                        setNewPlan={plan => {
                            handlePlanChange(plan);
                        }}
                    />
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

                        {instructorColumns}
                    </DataGrid>
                </div>
            </div>
        </div>
    );
};



export default PlacementsPage2;