import { useContext } from "react";
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import { DataGrid } from "devextreme-react";
import { Column, Paging, HeaderFilter, ColumnChooser, ColumnFixing, StateStoring }
    from "devextreme-react/data-grid";
import { firstClickDescSort } from "../../../utils/datagridutils";

import useDS from "./hooks/useds";
import useBlankSectorId from "./hooks/useblanksectorid";

import settingsConstants from '../../../utils/settingsconstants.json';
import pageText from '../statustablespagetext.json';

const AllSectorsStatusTable = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const dataSource = useDS();
    const blankSectorId = useBlankSectorId();

    return (
        <div>
            <h5>
                {pageText.allSectorsTable}
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
                    storageKey='allSectorsStatusesDataGridStateStoring'
                />

                <Column
                    dataField="statusName"
                    caption={pageText.status}
                    sortOrder="asc"
                />
                {blankSectorId ? (
                    <Column
                        dataField={`${blankSectorId}`}
                        caption={pageText.noSector}
                        dataType="number"
                    />
                ) : null}
                {storeData.sectors.filter(sector => sector.desc).map(sector => (
                    <Column
                        key={sector.id}
                        dataField={`${sector.id}`}
                        caption={sector.desc}
                        dataType="number"
                    />
                ))}

            </DataGrid>
        </div>
    );
};

export default AllSectorsStatusTable;