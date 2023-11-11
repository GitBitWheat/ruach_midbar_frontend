import { useContext, useMemo } from "react";
import { SchoolsContext } from '../../../../store/SchoolsContextProvider';

const useBlankSectorId = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    //Should be some constant id
    const blankSectorId = useMemo(() => {
            const blankSector = storeData.sectors.find(sector => sector.desc === null);
            return blankSector ? blankSector.id : null;
        }, [storeData.sectors]
    );

    return blankSectorId;
};

export default useBlankSectorId;