import { useCallback } from "react";
import pageText from './useclearfiltersbuttontext.json';

/**
 * @param {React.Ref<import('devextreme-react').DataGrid>} dgRef 
 */
const useClearFiltersButton = dgRef => {
    const clearFilter = useCallback(() => {
        if (dgRef && dgRef.current) {
            /** @type {import('devextreme-react').DataGrid} */
            const dg = dgRef.current;

            dg.instance.clearFilter();
        }
    }, [dgRef]);

    return {
        text: pageText.buttonText,
        onClick: clearFilter
    };
};

export default useClearFiltersButton;