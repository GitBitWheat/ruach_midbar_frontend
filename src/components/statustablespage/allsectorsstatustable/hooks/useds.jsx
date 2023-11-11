import { useContext, useMemo } from "react";
import { SchoolsContext } from '../../../../store/SchoolsContextProvider';
import pageText from '../../statustablespagetext.json';

const useDS = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const ds = useMemo(() => storeData.schoolStatuses.map(status => {
        const statusRecord = {
            id: status.id,
            statusName: status.desc || pageText.noStatus
        };
        for (const sector of storeData.sectors) {
            statusRecord[sector.id] =
                storeData.schools
                .filter(school => school.status === status.desc && school.sector === sector.desc)
                .length;
        }
        return statusRecord;
    }), [storeData.schoolStatuses, storeData.sectors, storeData.schools]);

    return ds;
};

export default useDS;