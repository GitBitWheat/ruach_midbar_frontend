/**
 * A short click on a school name column cell expands the contacts list of that school.
 * A long click enables editing for that cell (assuming the editing mode supports editing by cell)
 * @param {import("devextreme/ui/data_grid").CellPreparedEvent} event The cell prepared event
 */
export const clickSchoolNameCellForExpandingRow = event => {
    if (event.column.dataField === 'name' && event.rowType !== 'header') {
        let timeout;
        let isLongClick = false;
        event.cellElement.addEventListener('mousedown', _mouseDownEvent => {
            timeout = setTimeout(() => {
                isLongClick = true;

                const editMode = event.component.option('editing').mode;
                if (['batch', 'cell'].includes(editMode)) {
                    event.component.editCell(event.rowIndex, 'name');
                }
            }, 200);
        });
        event.cellElement.addEventListener('mouseup', _mouseUpEvent => {
            clearTimeout(timeout);
        });

        event.cellElement.classList.add('expandRowCell');
        event.cellElement.addEventListener('click', clickEvent => {
            if (!isLongClick) {
                if (event.row.isExpanded) {
                    event.component.collapseRow(event.row.key);
                } else {
                    event.component.expandRow(event.row.key);
                }
            }
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            isLongClick = false;
        });
    }
};