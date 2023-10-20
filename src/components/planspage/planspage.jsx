import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { Fragment } from 'react';
import DataGrid,
    { Editing, Paging, HeaderFilter, Column, FormItem, ColumnChooser,
      ColumnFixing, Lookup, StateStoring, Toolbar, Item }
    from 'devextreme-react/data-grid';

import useLinkDataSource from '../../customhooks/uselinkdatasource';
import useSelectBox, { useSelectBoxOptions } from '../../customhooks/useselectbox/useselectbox';
import SelectEditCell from '../customcells/selecteditcell/selecteditcell';
import { SchoolsContext } from '../../store/SchoolsContextProvider'
import { SettingsContext } from '../settingscontext/settingscontext';

import Plan from '../../store/storeModels/plan.js';
import { sum, uniques } from '../../utils/arrayUtils';
import LinkCell from '../customcells/linkcell/linkcell';
import WhatsappCell from '../customcells/whatsappcell/whatsappcell';
import NumberEditCell from '../customcells/numbereditcell/numbereditcell';
import NumberLookupEditCell from '../customcells/numberlookupeditcell/numberlookupeditcell';
import ComboEditCell from '../customcells/comboeditcell/comboeditcell';

import useSearch from '../../customhooks/usesearch';
import useClearFiltersButton from '../../customhooks/useclearfiltersbutton/useclearfiltersbutton';
import useIdArraysFilter from '../../customhooks/useIdArraysFilter';

import settingsConstants from '../../utils/settingsconstants.json';
import { uploadProposalToDrive } from '../../utils/localServerRequests';

import pageText from './planspage-text.json';
import './planspage.css';

// Instructors column cell render
export const instructorsCellRender = ({ data }) => {
    const instructors = [data.instructor1, data.instructor2, data.instructor3, data.instructor4]
        .filter(inst => inst)
        .map(inst => inst.split('#'))
        .map(instSplt => [instSplt, instSplt.length >= 2 ? { href: instSplt[1] } : { 'aria-disabled': true }]);

    return <span>
        {instructors.map(([instSplit, aProps], idx) => (
            <Fragment key={idx}>
                <a {...aProps}>{instSplit[0]}</a>
                { idx < instructors.length - 1 && ', '}
            </Fragment>
        ))}
    </span>;
};

const proposalFilterDS = [
    {
        value: ['proposal', 'startswith', 'V'],
        text: 'V'
    },
    {
        value: null,
        text: '(Blanks)'
    }
];

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const PlansPage = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    const settings = useContext(SettingsContext);

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    // Year of which the datasources are filtered
    const [dataYear, yearSelectBoxProps] = useSelectBox(storeData.plans, 'year', settings.defaultYear);

    const [yearFilteredPlansDS, setYearFilteredPlansDS] = useState([]);
    useEffect(() => {
        if (dataYear === useSelectBoxOptions.ALL) {
            setYearFilteredPlansDS(storeData.plans);
        } else if (dataYear === useSelectBoxOptions.EMPTY) {
            setYearFilteredPlansDS(storeData.plans.filter(plan => !(!!plan.year)))
        } else {
            setYearFilteredPlansDS(storeData.plans.filter(plan => plan.year === dataYear));
        }
    }, [storeData.plans, dataYear]);

    // The overall overalls calculated over all plans of matching year and filters
    const [overallOverallsByFilters, setOverallOverallsByFilters] = useState(0);

    // Calculate the overall overalls by filters value
    const handleContentReady = useCallback(
        /** @param {import('devextreme/ui/data_grid').ContentReadyEvent} event */
        event => {
            const combinedFilter = event.component.getCombinedFilter();
            event.component.getDataSource().store().load({ filter: combinedFilter }).then(filteredRows => {
                setOverallOverallsByFilters(sum(filteredRows.map(row => row.overall ? parseInt(row.overall) : 0)));
            });
        }, []
    );

    // The overall overalls calculated over all plans of matching year
    const [overallOverallsByYear, setOverallOverallsByYear] = useState(0);
    useEffect(() => {
        setOverallOverallsByYear(sum(yearFilteredPlansDS.map(plan => plan.overall ? parseInt(plan.overall) : 0)));
    }, [yearFilteredPlansDS]);

    // Filter data sources for link columns
    const contactLinkDS = useLinkDataSource(yearFilteredPlansDS, 'contact');
    const planLinkDS = useLinkDataSource(yearFilteredPlansDS, 'plan');
    const linkDSLst = useMemo(
        () => [contactLinkDS, planLinkDS],
        [contactLinkDS, planLinkDS]
    );

    // Update link data sources after updating plans data source, and log the update
    const handleRowInserted = useCallback(event => {
        console.log('Added plan is: ', new Plan(event.data));
    }, []);
    const handleRowRemoved = useCallback(event => {
        console.log('Removed plan is: ', new Plan(event.data));
    }, []);
    const handleRowUpdated = useCallback(event => {
        console.log('Updated plan is: ', new Plan(event.data));
    }, []);

    // Request the server to update the data source, proceed if request succeeded
    const handleRowInserting = useCallback(event => {
        const school = storeLookupData.schools.get(event.data.schoolId);
        const planData = new Plan({
            ...event.data,
            institution: school.name,
            contact: school.representative,
            city: school.city,
            level: school.level,
            sym: school.sym
        });
        const isCanceled = new Promise(resolve => {
            storeMethods.addPlan(planData)
                .then((validationResult) => {
                    for (const linkDs of linkDSLst) {
                        linkDs.add(planData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, linkDSLst, storeLookupData]);

    const handleRowRemoving = useCallback(event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deletePlan(event.key)
                .then((validationResult) => {
                    for (const linkDs of linkDSLst) {
                        linkDs.remove(event.data);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, linkDSLst]);

    const handleRowUpdating = useCallback(event => {
        const school = storeLookupData.schools.get(event.newData.schoolId || event.oldData.schoolId);
        const planData = new Plan({
            ...event.oldData,
            ...event.newData,
            institution: school.name,
            contact: school.representative,
            city: school.city,
            level: school.level,
            sym: school.sym
        });
        const isCanceled = new Promise(resolve => {
            storeMethods.updatePlan(event.key, planData)
                .then((validationResult) => {
                    for (const linkDs of linkDSLst) {
                        linkDs.update(event.oldData, planData);
                    }
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, linkDSLst, storeLookupData]);

    // Using values from diffrent data fields for the schoolId column
    const schoolIdCellRender = useCallback(({ value }) => {
        const school = storeLookupData.schools.get(value);
        return school ? school.name :
            <span className='dataError'>{pageText.schoolNonExistentError}</span>;
    }, [storeLookupData.schools]);

    // Lookup datasources for some columns
    const [statusesLookupDS, setStatusesLookupDS] = useState([]);
    useEffect(() => {
        setStatusesLookupDS(uniques(yearFilteredPlansDS.map(plan => plan.status).filter(val => val)));
    }, [yearFilteredPlansDS]);
    const [invitationsLookupDS, setInvitationsLookupDS] = useState([]);
    useEffect(() => {
        setInvitationsLookupDS(uniques(yearFilteredPlansDS.map(plan => plan.invitation).filter(val => val)));
    }, [yearFilteredPlansDS]);
    const [districtsLookupDS, setDistrictsLookupDS] = useState([]);
    useEffect(() => {
        setDistrictsLookupDS(uniques(yearFilteredPlansDS.map(plan => plan.district).filter(val => val)));
    }, [yearFilteredPlansDS]);
    const [plansLookupDS, setPlansLookupDS] = useState([]);
    useEffect(() => {
        setPlansLookupDS(
            uniques(yearFilteredPlansDS.map(plan => plan.plan).filter(val => val))
            .map(plan => ({ value: plan, display: plan.split('#')[0] }))
        );
    }, [yearFilteredPlansDS]);

    const [schoolLevelHeaderFilterDS, schoolLevelCalculateFilterExpr] =
        useIdArraysFilter(yearFilteredPlansDS, 'schoolId', 'level', storeLookupData.schools);
    const [schoolCityHeaderFilterDS, schoolCityCalculateFilterExpr] =
        useIdArraysFilter(yearFilteredPlansDS, 'schoolId', 'city', storeLookupData.schools);
    
    const [schoolsLookupDS, setSchoolsLookupDS] = useState([]);
    useEffect(() => {
        setSchoolsLookupDS(storeData.schools.map(school => ({
            id: school.id,
            nameCity: school.name + (school.city ? ' - ' + school.city : '')
        })))
    }, [storeData.schools]);


    const processPlan = useCallback(plan => {
        const school = storeLookupData.schools.get(plan.schoolId);
        if (school) {
            return {
                ...plan,
                level: school.level,
                sym: school.sym,
                schoolName: school.name,
                city: school.city,
                representative: school.representative
            };
        } else {
            return plan;
        }
    }, [storeLookupData.schools]);
    
    // Displayed searched plans
    const [searchedPlansDS, searchOptions] = useSearch(yearFilteredPlansDS, pageText.search, dgRef, processPlan);

    const handleInitNewRow = useCallback(event => {
        if (!Object.values(useSelectBoxOptions).includes(dataYear)) {
            event.data.year = dataYear;
        }
    }, [dataYear]);

    const proposalEditCellComponent = useCallback(({ data }) => {
        const plan = data.data;
        const school = storeLookupData.schools.get(plan.schoolId);
        return (
            <input
                type="file"
                onChange={event => {
                    if (!(plan.year && plan.district && school && school.city && school.name)) {
                        alert(pageText.notEnoughParameters);
                        return;
                    }
                    (async () => {
                        const drive_link = await uploadProposalToDrive(
                            event.target.files[0], plan.year, plan.district,
                            school.city, school.name
                        );
                        if (drive_link) {
                            data.setValue(`V#${drive_link}#`);
                        } else {
                            alert(pageText.proposalUploadFailed);
                        }
                    })();
                }}
            />
        );
    }, [storeLookupData.schools]);

    return (
        <div id="data-grid-demo">
            <DataGrid
                ref={dgRef}
                dataSource={searchedPlansDS}
                keyExpr="id"
                onRowInserted={handleRowInserted}
                onRowRemoved={handleRowRemoved}
                onRowUpdated={handleRowUpdated}
                onRowInserting={handleRowInserting}
                onRowRemoving={handleRowRemoving}
                onRowUpdating={handleRowUpdating}
                onContentReady={handleContentReady}
                onInitNewRow={handleInitNewRow}
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
                    storageKey='plansDataGridStateStoring'
                />
                <Toolbar>
                    <Item
                        location='before'
                        template={() =>
                            `<span>
                                <b>${pageText.overallPricing} </b>
                                <em>${pageText.overallPricingByYear}: </em>
                                ${numberWithCommas(overallOverallsByYear)}\u20AA,
                                <em>${pageText.overallPricingByFilters}: </em>
                                ${numberWithCommas(overallOverallsByFilters)}\u20AA
                            </span>`
                        }
                    />
                    <Item
                        widget='dxSelectBox'
                        options={yearSelectBoxProps}
                    />
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
                    dataField='year'
                    dataType='string'
                    caption={pageText.year}
                    allowEditing={dataYear === useSelectBoxOptions.ALL}
                />
                <Column
                    dataField='proposal'
                    dataType='string'
                    caption={pageText.proposal}
                    cellRender={LinkCell}
                    editCellComponent={proposalEditCellComponent}
                >
                    <HeaderFilter dataSource={proposalFilterDS} />
                    <FormItem visible={false} />
                </Column>
                <Column
                    dataField='status'
                    dataType='string'
                    caption={pageText.status}
                    editCellComponent={ComboEditCell}
                >
                    <Lookup
                        dataSource={{
                            store: statusesLookupDS,
                            paginate: true,
                            pageSize: settingsConstants.columnLookupPageSize
                        }}
                    />
                </Column>
                <Column
                    dataField='invitation'
                    dataType='string'
                    caption={pageText.invitation}
                    editCellComponent={ComboEditCell}
                >
                    <Lookup
                        dataSource={{
                            store: invitationsLookupDS,
                            paginate: true,
                            pageSize: settingsConstants.columnLookupPageSize
                        }}
                    />
                </Column>
                <Column
                    name='schoolLevel'
                    dataField='schoolId'
                    dataType='number'
                    caption={pageText.level}
                    allowEditing={false}
                    headerFilter={{ dataSource: schoolLevelHeaderFilterDS }}
                    calculateFilterExpression={schoolLevelCalculateFilterExpr}
                >
                    <FormItem visible={false} />
                    <Lookup
                        dataSource={storeData.schools}
                        valueExpr='id'
                        displayExpr='level'
                    />
                </Column>
                <Column
                    name='schoolSym'
                    dataField='schoolId'
                    dataType='number'
                    caption={pageText.sym}
                    allowEditing={false}
                >
                    <FormItem visible={false} />
                    <Lookup
                        dataSource={storeData.schools}
                        valueExpr='id'
                        displayExpr='sym'
                    />
                </Column>
                <Column
                    name='schoolName'
                    dataField='schoolId'
                    dataType='number'
                    caption={pageText.institution}
                    editCellComponent={SelectEditCell}
                    cellRender={schoolIdCellRender}
                >
                    <Lookup
                        dataSource={{
                            store: schoolsLookupDS,
                            paginate: true,
                            pageSize: settingsConstants.columnLookupPageSize
                        }}
                        valueExpr='id'
                        displayExpr='nameCity'
                    />
                </Column>
                <Column
                    name='schoolCity'
                    dataField='schoolId'
                    dataType='number'
                    caption={pageText.city}
                    allowEditing={false}
                    headerFilter={{ dataSource: schoolCityHeaderFilterDS }}
                    calculateFilterExpression={schoolCityCalculateFilterExpr}
                >
                    <FormItem visible={false} />
                    <Lookup
                        dataSource={storeData.schools}
                        valueExpr='id'
                        displayExpr='city'
                    />
                </Column>
                <Column
                    name='schoolRep'
                    dataField='schoolId'
                    dataType='number'
                    caption={pageText.contact}
                    allowEditing={false}
                    allowFiltering={false}
                    cellRender={WhatsappCell}
                >
                    <FormItem visible={false} />
                    <Lookup
                        dataSource={storeData.schools}
                        valueExpr='id'
                        displayExpr='representative'
                    />
                </Column>
                <Column
                    dataField='date'
                    dataType='date'
                    caption={pageText.date}
                    format='dd/MM/yyyy'
                />
                <Column
                    dataField='district'
                    dataType='string'
                    caption={pageText.district}
                    editCellComponent={ComboEditCell}
                >
                    <Lookup
                        dataSource={{
                            store: districtsLookupDS,
                            paginate: true,
                            pageSize: settingsConstants.columnLookupPageSize
                        }}
                    />
                </Column>
                <Column
                    dataField='plan'
                    dataType='string'
                    caption={pageText.plan}
                    cellRender={LinkCell}
                    editCellComponent={ComboEditCell}
                >
                    <HeaderFilter dataSource={planLinkDS.dataSource} />
                    <Lookup
                        dataSource={{
                            store: plansLookupDS,
                            paginate: true,
                            pageSize: settingsConstants.columnLookupPageSize
                        }}
                        valueExpr='value'
                        displayExpr='display'
                    />
                </Column>
                <Column
                    dataField='days'
                    dataType='string'
                    caption={pageText.days}
                />
                <Column
                    dataField='day'
                    dataType='string'
                    caption={pageText.day}
                />
                <Column
                    dataField='weeks'
                    dataType='number'
                    caption={pageText.weeks}
                    editCellComponent={NumberEditCell}
                />
                <Column
                    dataField='grade'
                    dataType='string'
                    caption={pageText.grade}
                />
                <Column
                    dataField='lessonsPerDay'
                    dataType='number'
                    caption={pageText.lessonsPerDay}
                    editCellComponent={NumberLookupEditCell}
                />
                <Column
                    dataField='lessons'
                    dataType='number'
                    caption={pageText.lessons}
                    editCellComponent={NumberEditCell}
                />
                <Column
                    dataField='pricePerHour'
                    dataType='number'
                    caption={pageText.pricePerHour}
                    editCellComponent={NumberEditCell}
                />
                <Column
                    dataField='overall'
                    dataType='number'
                    caption={pageText.overall}
                    allowEditing={false}
                    editCellComponent={NumberEditCell}
                >
                    <FormItem visible={false} />
                </Column>
                <Column
                    name='instructors'
                    dataType='string'
                    caption={pageText.instructors}
                    cellRender={instructorsCellRender}
                    allowEditing={false}
                >
                    <FormItem visible={false} />
                </Column>
                <Column
                    dataField='details'
                    dataType='string'
                    caption={pageText.details}
                />
            </DataGrid>
        </div>
    );
};

export default PlansPage;