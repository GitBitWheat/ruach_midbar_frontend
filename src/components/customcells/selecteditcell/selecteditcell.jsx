import { useCallback } from "react";
import { SelectBox } from "devextreme-react";
import pageText from './selecteditcelltext.json';

/**
 * Lookup based custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnCellTemplateData} props.data Data prop
 */
const SelectEditCell = ({ data }) => {

    const onValueChanged = useCallback(event => {
        data.setValue(event.value);
    }, [data]);
    const onSelectionChanged = useCallback(() => {
        data.component.updateDimensions();
    }, [data]);

    return (
        <SelectBox
            dataSource={data.column.lookup.dataSource}
            defaultValue={data.value}
            valueExpr={data.column.lookup.valueExpr}
            displayExpr={data.column.lookup.displayExpr}
            searchEnabled={true}
            onValueChanged={onValueChanged}
            onSelectionChanged={onSelectionChanged}
            rtlEnabled={true}
            placeholder={pageText.select}
        />
    );
};



export default SelectEditCell;