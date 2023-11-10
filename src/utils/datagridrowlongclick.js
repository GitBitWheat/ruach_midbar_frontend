const holdLen = 500;

/** @param {Function} logic */
export const dataGridRowLongClick = logic =>
    /** @param {import('devextreme/ui/data_grid').RowPreparedEvent} event */
    event => {
        if (event.rowType === 'data') {
            let lastTimeout = null;
            event.rowElement.addEventListener('mousedown', _event => {
                clearTimeout(lastTimeout);
                lastTimeout = setTimeout(() => {logic(event.data);}, holdLen);
            });
            event.rowElement.addEventListener('mouseup', _event => {
                clearTimeout(lastTimeout);
            });
        }
    };