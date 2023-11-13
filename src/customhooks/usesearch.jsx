import { useState, useEffect } from 'react';

const id = x => x;

// Need to add search for numberic values and arrays
/**
 * @param {Array} dataSource 
 * @param {string} placeholder 
 * @param {React.RefObject<import('devextreme-react').DataGrid>} dgRef 
 * @returns Data source filtered by the search text, and options for the search textbox
 */
const useSearch = (dataSource, placeholder, dgRef, process=id) => {

    const [searchText, setSearchText] = useState('');
    const [filteredDS, setFilteredDS] = useState([]);

    useEffect(() => {
        const searchTextTokens = searchText.split(' ');

        setFilteredDS(searchText ? dataSource.filter(record => 
            searchTextTokens.every(token =>
                Object.values(process(record)).some(val =>
                    ((typeof val === 'string') && val.includes(token)) ||
                    (Array.isArray(val) && val.some(subVal =>
                        (typeof subVal === 'string') && subVal.includes(token)))
                )
            )
        ) : dataSource);
    }, [dataSource, searchText, process]);

    // Props for the search item in the toolbar
    const [searchOptions, setSearchOptions] = useState({});

    useEffect(() => {
        setSearchOptions({
            placeholder: placeholder,
            value: searchText,
            width: 300,
            onEnterKey: event => {
                setSearchText(event.event.target.value);

                // Searching for a value clears filters
                if (dgRef && dgRef.current) {
                    dgRef.current.instance.clearFilter();
                }
            }
        });
    }, [searchText, setSearchText, placeholder, dgRef]);

    return [filteredDS, searchOptions];
};

export default useSearch;