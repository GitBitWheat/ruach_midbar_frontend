import DataGrid, { Column, Editing, ColumnFixing, Texts } from "devextreme-react/data-grid";
import { dirDataFields } from "./dirdatafields";

import useDirFiles from "./hooks/usedirfiles";

import { filesCellRenderGenerator } from "./misc/filescellrendergenerator";
import { filesEditCellRenderGenerator } from "./misc/fileseditcellrendergenerator";

import '../instructoruploadspage.css';
import pageText from '../instructorspagetext.json';

const InstructorDirs = ({ data }) => {

    const instructorDirName =
        data.data.firstName.split('#')[0] + (data.data.lastName ? ' ' + data.data.lastName : '');
    
    const [uploadedFiles, handleFileDelete, handleFileChange] = useDirFiles(data, instructorDirName);

    const filesCellRender = filesCellRenderGenerator(uploadedFiles, handleFileDelete);
    const filesEditCellRender = filesEditCellRenderGenerator(handleFileChange);

    return (
        <div className="schoolTable">
            <div id="data-grid-demo">
                <DataGrid
                    dataSource={dirDataFields}
                    keyExpr="id"
                    showBorders={true}
                    width='95vw'
                >
                    <Editing
                        mode={'form'}
                        allowUpdating={true}
                        allowAdding={false}
                    >
                        <Texts
                            editRow={pageText.addFile}
                        />
                    </Editing>
                    <ColumnFixing enabled={true} />

                    <Column
                        dataField='dirName'
                        caption={pageText.dirName}
                        dataType='string'
                        width='10vw'
                        allowEditing={false}
                    />
                    <Column
                        caption={pageText.files}
                        cellRender={filesCellRender}
                        editCellRender={filesEditCellRender}
                    />
                </DataGrid>
            </div>
        </div>
    );
};

export default InstructorDirs;