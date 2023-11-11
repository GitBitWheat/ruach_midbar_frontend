import { useContext } from 'react';
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import pageText from '../contactspagetext.json';

const SchoolCellComponent = ({ data }) => {
    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;

    const school = storeLookupData.schools.get(data.value);

    return school ?
        <span>{(school.name || '') + (school.city ? ' - ' + school.city : '')}</span>
        : <span className='dataError'>{pageText.schoolNonExistentError}</span>;
};

export default SchoolCellComponent;