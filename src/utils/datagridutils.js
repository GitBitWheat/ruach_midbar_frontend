/**
 * onCellPrepared event handler. Sorting is descending for number columns in the first click.
 * @param {import("devextreme/ui/data_grid").CellPreparedEvent} event The cell prepared event
 */
export const firstClickDescSort = event => {
    if (event.rowType === 'header') {
        event.cellElement.addEventListener('click', clickEvent => {
            const sortOrder = event.column.sortOrder;
            const dataType = event.column.dataType;
            if (dataType === 'number' && sortOrder === undefined) {
                event.component.clearSorting();
                event.component.columnOption(event.column.index, 'sortOrder', 'desc');
                clickEvent.preventDefault();
                clickEvent.stopPropagation();
            }
        });
    }
};