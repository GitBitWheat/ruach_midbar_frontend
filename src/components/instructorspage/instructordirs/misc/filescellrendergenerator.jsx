export const filesCellRenderGenerator = (uploadedFiles, handleFileDelete) => ({ key }) => {
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
                        className="bi bi-file-excel"
                        onClick={handleFileDelete(cellId, index, fileId)}
                    />
                </span>
            ))}
        </div>
    );
};