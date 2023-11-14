const holdLen = 500;

/**
 * RowPrepared event handler. Constructs a long click event for the row, and assigns
 * longClickHandler to be its handler. longClickHandler gets the RowPreparedEvent object.
 * @param {function(import('devextreme/ui/data_grid').RowPreparedEvent): void} longClickHandler
*/
export const dataGridRowLongClick = longClickHandler =>
    /** @param {import('devextreme/ui/data_grid').RowPreparedEvent} event */
    event => {
        if (event.rowType === 'data') {
            let lastTimeout = null;
            event.rowElement.addEventListener('mousedown', _event => {
                clearTimeout(lastTimeout);
                lastTimeout = setTimeout(() => {longClickHandler(event);}, holdLen);
            });
            event.rowElement.addEventListener('mouseup', _event => {
                clearTimeout(lastTimeout);
            });
        }
    };