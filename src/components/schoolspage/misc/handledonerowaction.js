import School from '../../../store/storeModels/school';

const handleDoneRowAction = () => {

    const handleRowInserted = event => {
        console.log('Added school is: ', new School(event.data));
    };

    const handleRowRemoved = event => {
        console.log('Removed school is: ', event.data);
    };

    const handleRowUpdated = event => {
        const schoolData = new School({...event.oldData, ...event.newData});
        console.log('Updated school is: ', schoolData);
    };

    return [handleRowInserted, handleRowRemoved, handleRowUpdated];
};

export default handleDoneRowAction;