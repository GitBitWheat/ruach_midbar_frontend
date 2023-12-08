import { DataGrid } from 'devextreme-react';
import { Column, Editing, RowDragging } from 'devextreme-react/data-grid';
import pageText from './messagesform-text.json'

const contactStatusesCalculateCellValue = row =>
    row.contactStatuses.map(cs => cs.desc !== null && cs.desc !== '' ? cs.desc : pageText.emptyFilter).join(', ');
const rolesCalculateCellValue = row =>
    row.roles.map(role => role.desc !== null && role.desc !== '' ? role.desc : pageText.emptyFilter).join(', ');

/**
 * @param {Object} params
 * @param {Array<Object>} params.contactPriorities
 * @param {(event: import('devextreme/ui/data_grid').RowDraggingReorderEvent) => *} params.onReorder
 * @param {(event: import('devextreme/ui/data_grid').RowRemovingEvent) => *} params.onRowRemoving
 */
const ContactPrioritiesGrid = ({ contactPriorities, onReorder, onRowRemoving }) => {
    return (
        <DataGrid
            dataSource={contactPriorities}
            keyExpr="id"
            onRowRemoving={onRowRemoving}
        >
            <Editing
                allowAdding={false}
                allowUpdating={false}
                allowDeleting={true}
            />
            <RowDragging
                allowReordering={true}
                onReorder={onReorder}
                showDragIcons={true}
            />
            
            <Column
                dataField='isRep'
                dataType='string'
                caption={pageText.contactIsRepLabel}
            />
            <Column
                caption={pageText.contactStatusesLabel}
                calculateCellValue={contactStatusesCalculateCellValue}
            />
            <Column
                caption={pageText.contactRolesLabel}
                calculateCellValue={rolesCalculateCellValue}
            />
        </DataGrid>
    );
};

export default ContactPrioritiesGrid;