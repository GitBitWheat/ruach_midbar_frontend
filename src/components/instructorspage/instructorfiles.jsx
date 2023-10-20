import React, { useState, useEffect, useCallback } from "react";

import DataGrid, { Column, Editing, ColumnFixing, Texts } from "devextreme-react/data-grid";
import { instructorFileDirs } from "./data";

import { uploadInstructorFileToDriveMultiple, deleteDriveFileRequest, listInstructorFiles }
    from "../../utils/localServerRequests";

import './instructoruploadspage.css';
import pageText from './instructorspagetext.json';



const InstructorFiles = ({ data }) => {

    const instructorDirName =
        data.data.firstName.split('#')[0] + (data.data.lastName ? ' ' + data.data.lastName : '');
    
    // this keeps all files of all rows. we need to save it in the data itself
    const [uploadedFiles, setUploadedFiles] = useState({});

    useEffect(() => {
        if (!(!!data)) {
            console.log("InstructorFiles 1")
            setUploadedFiles({});
            return;
        }
        const instructorDirName =
            data.data.firstName.split('#')[0] + (data.data.lastName ? ' ' + data.data.lastName : '');
        (async () => {
            const filesByDir = await listInstructorFiles(
                data.data.area, data.data.city, instructorDirName,
                instructorFileDirs.map(({ dirName }) => dirName)
            );
            console.log(filesByDir);
            setUploadedFiles(
                Object.fromEntries(
                    instructorFileDirs.map(({ id }, idx) => [
                        id,
                        filesByDir[idx].map(driveFile => ({
                            fileId: driveFile.id,
                            fileName: driveFile.name,
                            driveLink: driveFile.webViewLink

                        }))
                    ])
                )
            );
        })();
    }, [data]);

    const handleFileDelete = useCallback((cellId, index, fileId) => async () => {
        const success = await deleteDriveFileRequest(fileId);
        if (!success) {
            return;
        }

        // Create a new object based on the current state
        const updatedUploadedFiles = { ...uploadedFiles };

        // Remove the file at the specified index for the specific instructor ID
        updatedUploadedFiles[cellId].splice(index, 1);

        // Update the state with the new object
        setUploadedFiles(updatedUploadedFiles);
    }, [uploadedFiles]);

    /**
     * This function is call per each cells when rendering
     * @param cell
     * @returns {JSX.Element}
     */
    const filesCellRender = useCallback(({ key }) => {
        const cellId = key;
        const selectedFiles = uploadedFiles[cellId] || [];
        return (
            <div className="filesRow">
                {selectedFiles.map(({fileName, driveLink, fileId}, index) => (
                    <span key={index}>
                        <a
                            href={driveLink}
                            target='_blank'
                            rel='noreferrer'
                        >
                            {fileName}{" "}
                        </a>
                        <i
                            class="bi bi-file-excel"
                            onClick={handleFileDelete(cellId, index, fileId)}
                        />
                    </span>
                ))}
            </div>
        );
    }, [uploadedFiles, handleFileDelete]);

    /**
     * this function is called when uploading a new file
     * @param setFile
     * @param cellId
     * @param cellData
     * @returns {(function(*): void)|*}
     */
    const handleFileChange = useCallback((setFile, cellId, cellData) => async event => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const uploadedFileMetadata = await uploadInstructorFileToDriveMultiple(selectedFile, data.data.area,
                data.data.city, instructorDirName, cellData.dirName);
            if (!(!!uploadedFileMetadata)) {
                return;
            }
                
            // Create a new object based on the current state
            const updatedUploadedFiles = { ...uploadedFiles };
            const currentSelectedFiles = updatedUploadedFiles[cellId] || [];
            currentSelectedFiles.push({
                fileName: selectedFile.name,
                fileId: uploadedFileMetadata.id,
                driveLink: uploadedFileMetadata.drive_link
            });

            // Update the uploadedFiles state with the selected file name for the specific instructor ID
            updatedUploadedFiles[cellId] = currentSelectedFiles;
            setFile(updatedUploadedFiles);
        }
    }, [uploadedFiles, data, instructorDirName]);

    /**
     * this function is getting called when creating or editing a row
     * @param cell
     * @returns {JSX.Element}
     */
    const filesEditCellRender = useCallback(cell => {
        return (
            <input
                type="file"
                onChange={handleFileChange(setUploadedFiles, cell.key, cell.data)}
            />
        );
    }, [handleFileChange]);

    return (
        <div className="schoolTable">
            <div id="data-grid-demo">
                <DataGrid
                    dataSource={instructorFileDirs}
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

export default InstructorFiles;