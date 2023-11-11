import { useContext } from "react";
import { SchoolsContext } from "../../store/SchoolsContextProvider";
import AllSectorsStatusTable from "./allsectorsstatustable/allsectorsstatustable";
import SectorStatusTable from "./sectorstatustable/sectorstatustable";
import './statustablespage.css';

const StatusTablesPage = () => {
    const storeCtx = useContext(SchoolsContext);
    const storeData = storeCtx.data;

    const blankSector = storeData.sectors.find(sector => sector.desc === null);

    return (
        <div id='statusTablesPage'>
            <AllSectorsStatusTable />
            <SectorStatusTable sector={blankSector} />
            {storeData.sectors.filter(sector => sector.desc).map(sector => (
                <SectorStatusTable key={sector.id} sector={sector} />
            ))}
        </div>
    );
};

export default StatusTablesPage;