/** @param {import('devextreme/ui/data_grid').ContentReadyEvent} event */
export const dataGridRightOnContentReady = event => {
    const maxScrollLeft = event.element.scrollWidth - event.element.clientWidth;
    event.component.option('scrollLeft', maxScrollLeft);
};