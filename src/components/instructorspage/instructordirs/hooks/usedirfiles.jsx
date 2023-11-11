import { useState, useEffect } from "react";
import { uploadInstructorFileToDriveMultiple, deleteDriveFileRequest, listInstructorFiles }
    from "../../../../utils/localServerRequests";
import { dirDataFields } from "../dirdatafields";

const useDirFiles = (data, instructorDirName) => {

    // this keeps all files of all rows. we need to save it in the data itself
    const [uploadedFiles, setUploadedFiles] = useState({});

    // Initialize the file directories of this instructor. Refresh when data (instructor) changes
    useEffect(() => {
        if (!(!!data)) {
            setUploadedFiles({});
            return;
        }
        const instructorDirName =
            data.data.firstName.split('#')[0] + (data.data.lastName ? ' ' + data.data.lastName : '');
        (async () => {
            const filesByDir = await listInstructorFiles(
                data.data.area, data.data.city, instructorDirName,
                dirDataFields.map(({ dirName }) => dirName)
            );
            setUploadedFiles(
                Object.fromEntries(
                    dirDataFields.map(({ id }, idx) => [
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

    const handleFileDelete = (cellId, index, fileId) => async () => {
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
    };

    /**
     * this function is called when uploading a new file
     * @param cellId
     * @param cellData
     * @returns {(function(*): void)|*}
     */
    const handleFileChange = (cellId, cellData) => async event => {
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
            setUploadedFiles(updatedUploadedFiles);
        }
    };

    return [uploadedFiles, handleFileDelete, handleFileChange];
};

export default useDirFiles;