import { useState } from "react";
import { pushSetter } from '../../utils/arrayUtils';

const useContactPriorities = () => {
    const [contactPriorities, setContactPriorities] = useState([]);

    const pushPriority = pushSetter(contactPriorities, setContactPriorities);

    /** @param {import('devextreme/ui/data_grid').RowDraggingReorderEvent} event */
    const onReorder = event => {
        const newPriorities =
            event.component.getVisibleRows()
            .map(row => row.data);

        const toIndex =
            newPriorities.findIndex(item => item.id === newPriorities[event.toIndex].id);
        const fromIndex =
            newPriorities.findIndex(item => item.id === event.itemData.id);

        newPriorities.splice(fromIndex, 1);
        newPriorities.splice(toIndex, 0, event.itemData);

        setContactPriorities(newPriorities);
    };

    /** @param {import('devextreme/ui/data_grid').RowRemovingEvent} event */
    const onRowRemoving = event => {
        setContactPriorities(
            [...contactPriorities].filter(prior => prior.id !== event.key)
        );
    };

    return [contactPriorities, pushPriority, onReorder, onRowRemoving];
};

export default useContactPriorities;