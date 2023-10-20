import { useContext, useMemo } from "react";
import { SchoolsContext } from '../../store/SchoolsContextProvider';
import { DataGrid } from "devextreme-react";
import { Column, Paging, HeaderFilter, ColumnChooser, ColumnFixing, StateStoring }
    from "devextreme-react/data-grid";
import { firstClickDescSort } from "../../utils/datagridutils";

import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './statustablespagetext.json';



const SectorStatusTable = ({ sector }) => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const dataSource = useMemo(() =>
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
                    .filter(school => school.status === status.desc && school.level === level.desc && school.sector === sector.desc)
                    .length;
            }
            return statusRecord;
        })
        .filter(statusRecord => storeData.levels.some(level => statusRecord[level.id] > 0)),
        [storeData.schoolStatuses, storeData.levels, storeData.schools, sector.desc]);

    //Should be some constant id
    const blankLevelId = useMemo(() => {
            const blankLevel = storeData.levels.find(level => level.desc === null);
            return blankLevel ? blankLevel.id : null;
        }, [storeData.levels]
    );



    return (
        <div>
            <h5>
                {`${pageText.sectorTable}: ${sector.desc || pageText.noSector}`}
            </h5>
            <DataGrid
                dataSource={dataSource}
                keyExpr="id"
                onCellPrepared={firstClickDescSort}
            >
                <Paging
                    enabled={true}
                    pageSize={settingsConstants.dataGridRowsPageSize}
                    defaultPageIndex={0}
                />
                <HeaderFilter
                    visible={true}
                    search={{ enabled: true }}
                    height={settingsConstants.headerFilterHeight}
                />
                <ColumnChooser enabled={true} />
                <ColumnFixing enabled={true} />
                <StateStoring
                    enabled={true}
                    type='localStorage'
                    storageKey={`${sector.desc || 'noSector'}SectorStatusesDataGridStateStoring`}
                />

                <Column
                    dataField="statusName"
                    caption={pageText.status}
                    sortOrder="asc"
                />
                {blankLevelId ? (
                    <Column
                        dataField={`${blankLevelId}`}
                        caption={pageText.noLevel}
                        dataType="number"
                    />
                ) : null}
                {storeData.levels.filter(level => level.desc).map(level => (
                    <Column
                        key={level.id}
                        dataField={`${level.id}`}
                        caption={level.desc}
                        dataType="number"
                    />
                ))}

            </DataGrid>
        </div>
    );
};



export default SectorStatusTable;