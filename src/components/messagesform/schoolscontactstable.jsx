import { useState, useEffect } from 'react';
import { DataGrid } from 'devextreme-react';
import { Column } from 'devextreme-react/data-grid';
import WhatsappCell from '../customcells/whatsappcell/whatsappcell';
import pageText from './messagesform-text.json'

const SchoolsContactsTable = ({ selectedSchools, selectedContacts }) => {
    const [ds, setDs] = useState([]);
    useEffect(() => {
        const schoolsContacts = [];
        for (const school of selectedSchools) {
            const contact = selectedContacts.find(contact => school.id === contact.schoolId);
            if (contact) {
                schoolsContacts.push({
                    id: contact.id,
                    name: school.name,
                    level: school.level,
                    sector: school.sector,
                    schoolType: school.schoolType,
                    city: school.city,
                    schoolStatus: school.status,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    role: contact.role,
                    phone: contact.phone
                });
            }
        }
        setDs(schoolsContacts);
    }, [selectedSchools, selectedContacts]);

    return (
        <DataGrid
            dataSource={ds}
            keyExpr="id"
        >
            <Column
                dataField='name'
                dataType='string'
                caption={pageText.selectedSchoolsTblHeaderName}
            />
            <Column
                dataField='level'
                dataType='string'
                caption={pageText.selectedSchoolsTblHeaderLevel}
            />
            <Column
                dataField='sector'
                dataType='string'
                caption={pageText.selectedSchoolsTblHeaderSector}
            />
            <Column
                dataField='schoolType'
                dataType='string'
                caption={pageText.selectedSchoolsTblHeaderSchoolType}
            />
            <Column
                dataField='city'
                dataType='string'
                caption={pageText.selectedSchoolsTblHeaderCity}
            />
            <Column
                dataField='schoolStatus'
                dataType='string'
                caption={pageText.selectedSchoolsTblHeaderSchoolStatus}
            />
            <Column
                dataField='firstName'
                dataType='string'
                caption={pageText.selectedContactsTblHeaderFirstName}
            />
            <Column
                dataField='lastName'
                dataType='string'
                caption={pageText.selectedContactsTblHeaderLastName}
            />
            <Column
                dataField='role'
                dataType='string'
                caption={pageText.selectedContactsTblHeaderRole}
            />
            <Column
                dataField='phone'
                dataType='string'
                caption={pageText.selectedContactsTblHeaderPhone}
                cellRender={WhatsappCell}
            />
        </DataGrid>
    );
};

export default SchoolsContactsTable;