import { useState, useEffect, useCallback, useContext } from 'react';

import DataGrid,
    { Column, Paging, Editing, HeaderFilter, ColumnChooser,
      ColumnFixing, Lookup, Selection, FormItem, StateStoring }
    from 'devextreme-react/data-grid';
import { SelectBox } from 'devextreme-react';

import WhatsappCell from '../customcells/whatsappcell/whatsappcell';
import { calculateWhatsappCellValue } from '../contactspage/misc/calculatewhatsappcellvalue';

import LinkCell from '../customcells/linkcell/linkcell';
import LinkEditCell from '../customcells/linkcell/linkeditcell';
import InstructorsCellRender from '../planspage/misc/instructorscellrender';

import Payment from '../../store/storeModels/payment';
import { SchoolsContext } from '../../store/SchoolsContextProvider';
import { SettingsContext } from '../settingscontext/settingscontext';
import { sum } from '../../utils/arrayUtils';
import Invitation from '../../store/storeModels/invitation';

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './paymentspagetext.json';
import './paymentspage.css';
import useSelectBox, { useSelectBoxOptions } from '../../customhooks/useselectbox/useselectbox';

const PaymentsPage = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    const settings = useContext(SettingsContext);

    // Filters the year for the whole page
    const [selectedSchool, setSelectedSchool] = useState(null);

    // Year of which the datasources are filtered
    const [dataYear, yearSelectBoxProps] = useSelectBox(storeData.plans, 'year', settings.defaultYear);

    const [schoolsDS, setSchoolsDS] = useState([]);
    useEffect(() => {
        let filteredPlans = [];
        if (dataYear === useSelectBoxOptions.ALL) {
            filteredPlans = storeData.plans;
        } else if (dataYear === useSelectBoxOptions.EMPTY) {
            filteredPlans = storeData.plans.filter(plan => !(!!plan.year));
        } else {
            filteredPlans = storeData.plans.filter(plan => plan.year === dataYear);
        }
        filteredPlans = filteredPlans.filter(plan => plan.proposal);

        const relevantSchools = new Set();
        for (const { schoolId } of filteredPlans) {
            const school = storeLookupData.schools.get(schoolId);
            if (school) {
                relevantSchools.add(school);
            }
        }
        setSchoolsDS([...relevantSchools]);
    }, [storeData.plans, storeLookupData.schools, dataYear]);

    // Update the selected school
    const handleSchoolSelectionChanged = useCallback(({ selectedRowsData }) => {
        if (selectedRowsData &&
            Array.isArray(selectedRowsData) &&
            selectedRowsData[0] &&
            typeof selectedRowsData[0] === 'object' &&
            Object.hasOwn(selectedRowsData[0], 'id')) {
            setSelectedSchool(storeLookupData.schools.get(selectedRowsData[0].id) || null);
        } else {
            setSelectedSchool(null);
        }
    }, [storeLookupData.schools]);

    // DataSource of the contacts DataGrid - Shows contacts of selected school
    const [contactsDS, setContactsDS] = useState([]);
    useEffect(() => {
        setContactsDS(
            selectedSchool ?
            storeData.contacts.filter(contact => contact.schoolId === selectedSchool.id) : []
        );
    }, [storeData.contacts, selectedSchool]);



    // DataSource of the plans DataGrid - show plan of selected school
    // of the selected year
    const [plansDS, setPlansDS] = useState([]);
    useEffect(() => {
        if (!(!!selectedSchool)) {
            setPlansDS([]);
        } else if (dataYear === useSelectBoxOptions.ALL) {
            setPlansDS(
                storeData.plans.filter(plan => plan.schoolId === selectedSchool.id)
            );
        } else if (dataYear === useSelectBoxOptions.EMPTY) {
            setPlansDS(
                storeData.plans.filter(plan => plan.schoolId === selectedSchool.id && !(!!plan.year))
            );
        } else {
            setPlansDS(
                storeData.plans.filter(plan => plan.schoolId === selectedSchool.id && plan.year === dataYear)
            );
        }
    }, [storeData.plans, selectedSchool, dataYear]);

    const plansInstructorsDisplayValue = useCallback(
        data => [data.instructor1, data.instructor2, data.instructor3, data.instructor4]
            .filter(inst => inst).map(inst => inst.split('#')[0]).join(', '),
        []
    );

    // DataSource of the pricing DataGrid - the pricing fields of each plan
    // of the selected school and the selected year
    const pricingDS = plansDS;

    // DataSource of the payments DataGrids - filtered by selected school and year
    const [paymentsDS, setPaymentsDS] = useState([]);
    useEffect(() => {
        setPaymentsDS(
            selectedSchool ?
            storeData.payments.filter(payment => payment.sym === selectedSchool.sym) : []
        );
    }, [storeData.payments, selectedSchool]);

    // Request the server to update the data source, proceed if request succeeded
    const handlePaymentsRowInserting = useCallback(event => {
        if (selectedSchool === null) {
            event.cancel = true;
            return;
        }
        // Replace sym with schoolId
        const paymentData = new Payment({
            ...event.data,
            sym: selectedSchool.sym,
            schoolName: selectedSchool.name,
            city: selectedSchool.city
        });
        const isCanceled = new Promise(resolve => {
            storeMethods.addPayment(paymentData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, selectedSchool]);

    const handlePaymentsRowRemoving = useCallback(event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deletePayment(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods]);

    const handlePaymentsRowUpdating = useCallback(event => {
        const paymentData = new Payment({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updatePayment(event.key, paymentData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods]);

    // DataSource of the invitations DataGrid - filtered by selected school
    const [invitationsDS, setInvitationsDS] = useState([]);
    useEffect(() => {
        setInvitationsDS(
            selectedSchool ?
            storeData.invitations.filter(invitation => invitation.sym === selectedSchool.sym) : []
        );
    }, [storeData.invitations, selectedSchool]);

    // Request the server to update the data source, proceed if request succeeded
    const handleInvitationsRowInserting = useCallback(event => {
        if (selectedSchool === null) {
            event.cancel = true;
            return;
        }
        // Replace sym with schoolId
        const invitationData = new Invitation({
            ...event.data,
            sym: selectedSchool.sym,
            schoolName: selectedSchool.name,
            city: selectedSchool.city
        });
        const isCanceled = new Promise(resolve => {
            storeMethods.addInvitation(invitationData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods, selectedSchool]);

    const handleInvitationsRowRemoving = useCallback(event => {
        const isCanceled = new Promise(resolve => {
            storeMethods.deleteInvitation(event.key)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods]);

    const handleInvitationsRowUpdating = useCallback(event => {
        const invitationData = new Invitation({...event.oldData, ...event.newData});
        const isCanceled = new Promise(resolve => {
            storeMethods.updateInvitation(event.key, invitationData)
                .then((validationResult) => {
                    resolve(!validationResult);
                });
        });
        event.cancel = isCanceled;
    }, [storeMethods]);

    // Left payments of the selected school
    const [left, setLeft] = useState(0);
    useEffect(() => {
        const planOverallSum = sum(plansDS.map(plan => Math.trunc(plan.overall)));
        const paymentsPayedSum = sum(paymentsDS.map(payment => Math.trunc(payment.payed)));
        setLeft(planOverallSum - paymentsPayedSum);
    }, [plansDS, paymentsDS]);



    return (
        <table className='paymentsPageMainTable'>
        <tbody>
            <tr>
                <td>
                    <h5>{pageText.year}</h5>
                    <SelectBox {...yearSelectBoxProps} />
                    
                    <h5>{pageText.schools}</h5>
                    <DataGrid
                        dataSource={schoolsDS}
                        keyExpr='id'
                        hoverStateEnabled={true}
                        onSelectionChanged={handleSchoolSelectionChanged}
                        columnAutoWidth={false}
                    >
                        <Paging
                            enabled={true}
                            pageSize={settingsConstants.dataGridRowsPageSize}
                            defaultPageIndex={0}
                        />
                        <HeaderFilter
                            visible={true}
                            search={{ enabled: true }}
                            height={settingsConstants.headerFilterHeight}
                        />
                        <Selection mode='single' />
                        <ColumnChooser enabled={true} />
                        <ColumnFixing enabled={true} />
                        <StateStoring
                            enabled={true}
                            type='localStorage'
                            storageKey='paymentsSchoolsDataGridStateStoring'
                        />
                    
                        <Column
                            dataField='sym'
                            dataType='number'
                            caption={pageText.sym}
                        />
                        <Column
                            dataField='name'
                            dataType='string'
                            caption={pageText.school}
                        />
                        <Column
                            dataField='city'
                            dataType='string'
                            caption={pageText.city}
                        />
                        <Column
                            dataField='level'
                            dataType='string'
                            caption={pageText.level}
                        />
                    </DataGrid>
                </td>
                <td>
                    <h5>{pageText.contacts}</h5>
                    <DataGrid
                        dataSource={contactsDS}
                        keyExpr='id'
                        columnAutoWidth={false}
                    >
                        <Paging
                            enabled={true}
                            pageSize={settingsConstants.dataGridRowsPageSize}
                            defaultPageIndex={0}
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
                            storageKey='paymentsContactsDataGridStateStoring'
                        />

                        <Column
                            dataField='firstName'
                            caption={pageText.firstName}
                            dataType='string'
                        />
                        <Column
                            dataField='lastName'
                            caption={pageText.lastName}
                            dataType='string'
                        />
                        <Column
                            dataField='role'
                            caption={pageText.role}
                            dataType='string'
                        />
                        <Column
                            dataField='phone'
                            caption={pageText.phone}
                            dataType='string'
                        />
                        <Column
                            name='whatsapp'
                            caption={pageText.whatsapp}
                            dataType='string'
                            cellRender={WhatsappCell}
                            calculateCellValue={calculateWhatsappCellValue}
                        />
                    </DataGrid>

                    <h5>{pageText.plans}</h5>
                    <DataGrid
                        dataSource={plansDS}
                        keyExpr='id'
                        columnAutoWidth={false}
                    >
                        <Paging
                            enabled={true}
                            pageSize={settingsConstants.dataGridRowsPageSize}
                            defaultPageIndex={0}
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
                            storageKey='paymentsPlansDataGridStateStoring'
                        />

                        <Column
                            dataField='status'
                            caption={pageText.status}
                            dataType='string'
                        />
                        <Column
                            dataField='plan'
                            caption={pageText.plan}
                            dataType='string'
                            cellRender={LinkCell}
                        />
                        <Column
                            dataField='day'
                            caption={pageText.day}
                            dataType='string'
                        />
                        <Column
                            caption={pageText.instructors}
                            dataType='string'
                            cellRender={InstructorsCellRender}
                            calculateDisplayValue={plansInstructorsDisplayValue}
                        />
                        <Column
                            dataField='invitation'
                            dataType='string'
                            caption={pageText.invitation}
                        />
                        <Column
                            dataField='year'
                            dataType='string'
                            caption={pageText.year}
                        />
                    </DataGrid>
                </td>
                <td>
                    <h5>{pageText.pricing}</h5>
                    <DataGrid
                        dataSource={pricingDS}
                        keyExpr='id'
                        columnAutoWidth={false}
                    >
                        <Paging
                            enabled={true}
                            pageSize={settingsConstants.dataGridRowsPageSize}
                            defaultPageIndex={0}
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
                            storageKey='paymentsPricingDataGridStateStoring'
                        />

                        <Column
                            dataField='plan'
                            caption={pageText.plan}
                            dataType='string'
                            cellRender={LinkCell}
                        />
                        <Column
                            dataField='lessons'
                            caption={pageText.lessons}
                            dataType='number'
                        />
                        <Column
                            dataField='pricePerHour'
                            caption={pageText.pricePerHour}
                            dataType='number'
                        />
                        <Column
                            dataField='overall'
                            caption={pageText.overall}
                            dataType='number'
                        />
                        <Column
                            dataField='year'
                            caption={pageText.year}
                            dataType='string'
                        />
                    </DataGrid>

                    <h5>{pageText.payments}</h5>
                    <DataGrid
                        dataSource={paymentsDS}
                        keyExpr='id'
                        onRowInserting={handlePaymentsRowInserting}
                        onRowRemoving={handlePaymentsRowRemoving}
                        onRowUpdating={handlePaymentsRowUpdating}
                        columnAutoWidth={false}
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
                            storageKey='paymentsPaymentsDataGridStateStoring'
                        />

                        <Column
                            dataField='issuer'
                            caption={pageText.issuer}
                            dataType='string'
                        />
                        <Column
                            // Please replace sym with schoolId
                            name='schoolName'
                            dataField='sym'
                            caption={pageText.schoolName}
                            dataType='number'
                            allowEditing={false}
                        >
                            <FormItem visible={false} />
                            <Lookup
                                dataSource={storeData.schools}
                                valueExpr='sym'
                                displayExpr='name'
                            />
                        </Column>
                        <Column
                            dataField='plan'
                            caption={pageText.plan}
                            dataType='string'
                        />
                        <Column
                            dataField='payed'
                            caption={pageText.payed}
                            dataType='string'
                        />
                    </DataGrid>

                    <h5>{pageText.invitations}</h5>
                    <DataGrid
                        dataSource={invitationsDS}
                        keyExpr='id'
                        onRowInserting={handleInvitationsRowInserting}
                        onRowRemoving={handleInvitationsRowRemoving}
                        onRowUpdating={handleInvitationsRowUpdating}
                        columnAutoWidth={false}
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
                            storageKey='paymentsInvitationsDataGridStateStoring'
                        />

                        <Column
                            dataField='issuer'
                            caption={pageText.issuer}
                            dataType='string'
                        />
                        <Column
                            dataField='issueDate'
                            caption={pageText.issueDate}
                            dataType='date'
                            format='dd/MM/yyyy'
                        />
                        <Column
                            dataField='planName'
                            caption={pageText.planName}
                            dataType='string'
                            cellRender={LinkCell}
                            editCellComponent={LinkEditCell}
                        />
                        <Column
                            dataField='payed'
                            caption={pageText.payed}
                            dataType='string'
                        />
                        <Column
                            dataField='checkDate'
                            caption={pageText.checkDate}
                            dataType='date'
                            format='dd/MM/yyyy'
                        />
                    </DataGrid>

                    <h5>{pageText.left}</h5>
                    <span>
                        {(left >= 0 ? `${left}\u20AA` : `${-left}\u20AA-`)}
                    </span>
                </td>
            </tr>
        </tbody>
        </table>
    );
};



export default PaymentsPage;