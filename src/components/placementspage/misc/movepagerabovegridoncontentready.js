/** @param {import('devextreme/ui/data_grid').ContentReadyEvent} event */
export const movePagerAboveGridOnContentReady = event => {
    const dxDataGrid = event.component.element().children.item(0);

    // Looking for the pager element
    let pager = null;
    let headerPanel = null;
    for (let i = 0; i < dxDataGrid.childNodes.length; ++i) {
        const child = dxDataGrid.children.item(i);
        if (child.classList.contains('dx-datagrid-pager')) {
            pager = child;
        } else if (child.classList.contains('dx-datagrid-header-panel')) {
            headerPanel = child;
        }
    }

    if (pager && headerPanel) {
        pager.classList.add('pagerAboveDataGrid');
        dxDataGrid.insertBefore(pager, headerPanel.nextSibling);
    }
};