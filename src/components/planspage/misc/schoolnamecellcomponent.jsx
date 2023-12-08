import { useContext, Fragment } from 'react';
import { StoreContext } from '../../../store/StoreContextProvider';
import pageText from '../planspage-text.json';

const SchoolNameCellComponent = ({ data }) => {
    const storeCtx = useContext(StoreContext);
    const storeLookupData = storeCtx.lookupData;

    const school = storeLookupData.schools.get(data.value);

    // Using values from diffrent data fields for the schoolId column
    return school ? (
        <Fragment>{school.name}</Fragment>
    ) : (
        <span className='dataError'>{pageText.schoolNonExistentError}</span>
    );
};

export default SchoolNameCellComponent;