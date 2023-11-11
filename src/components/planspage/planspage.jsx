import { useContext, useRef } from 'react';
import DataGrid,
    { Editing, Paging, HeaderFilter, Column, FormItem, ColumnChooser,
      ColumnFixing, Lookup, StateStoring, Toolbar, Item }
    from 'devextreme-react/data-grid';

import useLinkDataSource from '../../customhooks/uselinkdatasource';
import { useSelectBoxOptions } from '../../customhooks/useselectbox/useselectbox';
import useClearFiltersButton from '../../customhooks/useclearfiltersbutton/useclearfiltersbutton';
import useIdArraysFilter from '../../customhooks/useIdArraysFilter';
import useYearFilteredDS from './hooks/useyearfilteredds.jsx';
import useOveralls from './hooks/useoveralls.jsx';
import useHandleCurrentRowActions from './hooks/usehandlecurrentrowactions.jsx';
import useColsLookupDS from './hooks/usecolslookupds.jsx';
import useSearchPlan from './hooks/usesearchplan.jsx';

import { numberWithCommas } from './misc/numberwithcommas.js';
import { handleDoneRowActions } from '../schoolspage/misc/handledonerowactions.js';
import { dataGridRightOnContentReady } from '../../utils/datagridrightoncontentready.js';
import { initNewRowWithYear } from './misc/initnewrowwithyear.js';

import SchoolNameCellComponent from './misc/schoolnamecellcomponent.jsx';
import ProposalEditCellComponent from './misc/proposaleditcellcomponent.jsx';
import LinkCell from '../customcells/linkcell/linkcell';
import WhatsappCell from '../customcells/whatsappcell/whatsappcell';
import NumberEditCell from '../customcells/numbereditcell/numbereditcell';
import NumberLookupEditCell from '../customcells/numberlookupeditcell/numberlookupeditcell';
import ComboEditCell from '../customcells/comboeditcell/comboeditcell';
import SelectEditCell from '../customcells/selecteditcell/selecteditcell';
import InstructorsCellRender from './misc/instructorscellrender.jsx';

import { SchoolsContext } from '../../store/SchoolsContextProvider'
import { SettingsContext } from '../settingscontext/settingscontext';
import settingsConstants from '../../utils/settingsconstants.json';

import pageText from './planspage-text.json';
import './planspage.css';

const proposalFilterDS = [{
        value: ['proposal', 'startswith', 'V'],
        text: 'V'
    }, {
        value: null,
        text: '(Blanks)'
    }
];

const PlansPage = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;

    const settings = useContext(SettingsContext);

    const dgRef = useRef(null);
    const clearFiltersButtonOptions = useClearFiltersButton(dgRef);

    // Filtering the data source by a year
    const [dataYear, yearFilteredPlansDS, yearSelectBoxProps] = useYearFilteredDS();

    // Overall calculations, filtered by year alone, and by all filters,
    // for which byFiltersContentReadyHandler is necessary
    const [overallOverallsByFilters, overallOverallsByYear, byFiltersContentReadyHandler] =
        useOveralls(yearFilteredPlansDS);

    const contentReadyHandler = event => {
        byFiltersContentReadyHandler(event);
        dataGridRightOnContentReady(event);
    };

    // Filter data sources for link columns
    const contactLinkDS = useLinkDataSource(yearFilteredPlansDS, 'contact');
    const planLinkDS = useLinkDataSource(yearFilteredPlansDS, 'plan');
    const linkDSLst = [contactLinkDS, planLinkDS];

    const [handleRowInserting, handleRowRemoving, handleRowUpdating] = useHandleCurrentRowActions(linkDSLst);
    const [handleRowInserted, handleRowRemoved, handleRowUpdated] = handleDoneRowActions();

    // Lookup datasources for some columns
    const [statusesLookupDS, invitationsLookupDS, districtsLookupDS, plansLookupDS, schoolsLookupDS] =
        useColsLookupDS(yearFilteredPlansDS);

    const [schoolLevelHeaderFilterDS, schoolLevelCalculateFilterExpr] =
        useIdArraysFilter(yearFilteredPlansDS, 'schoolId', 'level', storeLookupData.schools);
    const [schoolCityHeaderFilterDS, schoolCityCalculateFilterExpr] =
        useIdArraysFilter(yearFilteredPlansDS, 'schoolId', 'city', storeLookupData.schools);

    const [searchedPlansDS, searchOptions] = useSearchPlan(yearFilteredPlansDS, dgRef);

    const initNewRowHandler = initNewRowWithYear(dataYear);

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
                onContentReady={contentReadyHandler}
                onInitNewRow={initNewRowHandler}
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
                    editCellComponent={ProposalEditCellComponent}
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
                    calculateFilterExpression={schoolLevelCalculateFilterExpr}
                >
                    <FormItem visible={false} />
                    <Lookup
                        dataSource={storeData.schools}
                        valueExpr='id'
                        displayExpr='level'
                    />
                    <HeaderFilter dataSource={schoolLevelHeaderFilterDS} />
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
                    cellComponent={SchoolNameCellComponent}
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
                    calculateFilterExpression={schoolCityCalculateFilterExpr}
                >
                    <FormItem visible={false} />
                    <Lookup
                        dataSource={storeData.schools}
                        valueExpr='id'
                        displayExpr='city'
                    />
                    <HeaderFilter dataSource={schoolCityHeaderFilterDS} />
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
                    cellRender={InstructorsCellRender}
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