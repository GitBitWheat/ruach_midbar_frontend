import { useContext, useMemo } from "react";
import { SchoolsContext } from '../../../../store/SchoolsContextProvider';

const useBlankLevelId = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    // Should be some constant id
    const blankLevelId = useMemo(() => {
            const blankLevel = storeData.levels.find(level => level.desc === null);
            return blankLevel ? blankLevel.id : null;
        }, [storeData.levels]
    );
    
    return blankLevelId;
};

export default useBlankLevelId;