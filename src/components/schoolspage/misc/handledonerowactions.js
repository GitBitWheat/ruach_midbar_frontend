import Plan from '../../../store/storeModels/plan';

export const handleDoneRowActions =() => {

    // Update link data sources after updating plans data source, and log the update
    const handleRowInserted = event => {
        console.log('Added plan is: ', new Plan(event.data));
    };
    const handleRowRemoved = event => {
        console.log('Removed plan is: ', new Plan(event.data));
    };
    const handleRowUpdated = event => {
        console.log('Updated plan is: ', new Plan(event.data));
    };

    return [handleRowInserted, handleRowRemoved, handleRowUpdated];
};