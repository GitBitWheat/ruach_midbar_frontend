import { useContext, useMemo } from "react";
import { StoreContext } from '../../../../store/StoreContextProvider';

const useBlankSectorId = () => {
    const storeCtx = useContext(StoreContext);
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