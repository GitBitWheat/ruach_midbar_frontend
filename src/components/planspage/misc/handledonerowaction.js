import Plan from '../../../store/storeModels/plan';

export const handleDoneRowAction =() => {

    // Update link data sources after updating plans data source, and log the update
    const handleRowInserted = event => {
        console.log('Added plan is: ', new Plan(event.data));
    };
    const handleRowRemoved = event => {
        console.log('Removed plan is: ', new Plan(event.data));
    };
    const handleRowUpdated = event => {
        console.log('Updated plan is: ', new Plan({...event.oldData, ...event.newData}));
    };

    return [handleRowInserted, handleRowRemoved, handleRowUpdated];
};