import { useCallback } from "react";
import { SelectBox } from "devextreme-react";
import pageText from './selecteditcelltext.json';



/**
 * Combo box like custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnCellTemplateData} props.data Data prop
 */
const ComboEditCell = ({ data }) => {

    const handleInput = useCallback(_event => {
    }, []);
    const handleSelectionChanged = useCallback(() => {
        data.component.updateDimensions();
    }, [data]);
    const handleEnterKey = useCallback(
        /** @param {import("devextreme/ui/select_box").EnterKeyEvent} event */
        event => {
            data.setValue(event.event.currentTarget.value);
        }, [data]
    );

    return (
        <SelectBox
            dataSource={data.column.lookup.dataSource}
            defaultValue={data.value}
            valueExpr={data.column.lookup.valueExpr}
            displayExpr={data.column.lookup.displayExpr}
            searchEnabled={true}
            onInput={handleInput}
            onSelectionChanged={handleSelectionChanged}
            rtlEnabled={true}
            placeholder={pageText.select}
            acceptCustomValue={true}
            onEnterKey={handleEnterKey}
        />
    );
};



export default ComboEditCell;