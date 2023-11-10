/** @param {import('devextreme/ui/data_grid').ContentReadyEvent} event */
export const dataGridRightOnContentReady = event => {
    if (event.component.getScrollable()) {
        const maxScrollLeft =
            event.component.getScrollable().scrollWidth() - event.component.getScrollable().clientWidth();
        event.component.getScrollable().scrollBy({ left: maxScrollLeft, top: 0 });
    }
};