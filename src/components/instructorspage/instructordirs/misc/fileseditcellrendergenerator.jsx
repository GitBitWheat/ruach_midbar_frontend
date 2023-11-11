export const filesEditCellRenderGenerator = handleFileChange => cell => (
    <input
        type="file"
        onChange={handleFileChange(cell.key, cell.data)}
    />
);