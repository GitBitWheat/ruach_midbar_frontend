import { useContext, useMemo } from "react";
import { SchoolsContext } from '../../../../store/SchoolsContextProvider';
import pageText from '../../statustablespagetext.json';

const useDS = sector => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const ds = useMemo(() =>
        storeData.schoolStatuses
        .filter(status => status)
        .map(status => {
            const statusRecord = {
                id: status.id,
                statusName: status.desc || pageText.noStatus
            };
            for (const level of storeData.levels) {
                statusRecord[level.id] =
                    storeData.schools
                    .filter(school => school.status === status.desc &&
                        school.level === level.desc && school.sector === sector.desc)
                    .length;
            }
            return statusRecord;
        })
        .filter(statusRecord => storeData.levels.some(level => statusRecord[level.id] > 0)),
        [storeData.schoolStatuses, storeData.levels, storeData.schools, sector.desc]);

    return ds;
};

export default useDS;