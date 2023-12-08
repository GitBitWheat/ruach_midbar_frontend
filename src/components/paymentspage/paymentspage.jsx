import { useContext } from 'react';

import DataGrid,
    { Column, Paging, Editing, HeaderFilter, ColumnChooser,
      ColumnFixing, Lookup, Selection, FormItem, StateStoring }
    from 'devextreme-react/data-grid';
import { SelectBox } from 'devextreme-react';

import useSelectBox from '../../customhooks/useselectbox/useselectbox';
import useSchoolSelection from './hooks/useschoolselection';
import useSchoolsDS from './hooks/useschoolsds';
import usePlansDS from './hooks/useplansds';
import useContactsDS from './hooks/usecontactsds';
import usePaymentsDS from './hooks/usepaymentsds';
import useInvitationsDS from './hooks/useinvitationsds';
import useHandleCurrentPaymentsRowAction from './hooks/usehandlecurrentpaymentsrowaction';
import useHandleCurrentInvitationsRowAction from './hooks/usehandlecurrentinvitationsrowaction';
import useSelectedSchoolLeftPayments from './hooks/useselectedschoolleftpayments';

import WhatsappCell from '../customcells/whatsappcell/whatsappcell';
import LinkCell from '../customcells/linkcell/linkcell';
import LinkEditCell from '../customcells/linkcell/linkeditcell';

import InstructorsCellRender from '../planspage/misc/instructorscellrender';
import { calculateWhatsappCellValue } from '../contactspage/misc/calculatewhatsappcellvalue';
import { plansInstsCalculateDisplayValue } from './misc/plansinstscalculatedisplayvalue';

import { StoreContext } from '../../store/StoreContextProvider';
import { SettingsContext } from '../settingscontext/settingscontext';

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './paymentspagetext.json';
import './paymentspage.css';

const PaymentsPage = () => {

    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    const settings = useContext(SettingsContext);

    const [selectedSchool, handleSchoolSelectionChanged] = useSchoolSelection();

    // Year of which the datasources are filtered
    const [dataYear, yearSelectBoxProps] = useSelectBox(storeData.plans, 'year', settings.defaultYear);

    const schoolsDS = useSchoolsDS(dataYear);
    const contactsDS = useContactsDS(selectedSchool);
    const plansDS = usePlansDS(selectedSchool, dataYear);
    const paymentsDS = usePaymentsDS(selectedSchool);
    const invitationsDS = useInvitationsDS(selectedSchool);

    // DataSource of the pricing DataGrid - the pricing fields of each plan
    // of the selected school and the selected year
    const pricingDS = plansDS;

    const [handlePaymentsRowInserting, handlePaymentsRowRemoving, handlePaymentsRowUpdating] =
        useHandleCurrentPaymentsRowAction(selectedSchool);
    const [handleInvitationsRowInserting, handleInvitationsRowRemoving, handleInvitationsRowUpdating] =
        useHandleCurrentInvitationsRowAction(selectedSchool); 

    const left = useSelectedSchoolLeftPayments(plansDS, paymentsDS);

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
                            calculateDisplayValue={plansInstsCalculateDisplayValue}
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