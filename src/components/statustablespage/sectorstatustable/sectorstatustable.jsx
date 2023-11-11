import { useContext } from "react";
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import { DataGrid } from "devextreme-react";
import { Column, Paging, HeaderFilter, ColumnChooser, ColumnFixing, StateStoring }
    from "devextreme-react/data-grid";
import { firstClickDescSort } from "../../../utils/datagridutils";

import useDS from "./hooks/useds";
import useBlankLevelId from "./hooks/useblanklevelid";

import settingsConstants from '../../../utils/settingsconstants.json';
import pageText from '../statustablespagetext.json';

const SectorStatusTable = ({ sector }) => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const dataSource = useDS(sector);
    const blankLevelId = useBlankLevelId();

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