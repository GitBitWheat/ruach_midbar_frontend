import { useCallback } from "react";
import { SelectBox } from "devextreme-react";

/**
 * SelectBox based custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnCellTemplateData} props.data Data prop
 */
const NumberLookupEditCell = ({ data }) => {

    const onValueChanged = useCallback(event => {
        data.setValue(event.value);
    }, [data]);
    const onSelectionChanged = useCallback(() => {
        data.component.updateDimensions();
    }, [data]);

    return (
        <SelectBox
            dataSource={[...Array(11).keys()]}
            value={data.value}
            searchEnabled={true}
            onValueChanged={onValueChanged}
            onSelectionChanged={onSelectionChanged}
            rtlEnabled={true}
            acceptCustomValue={true}
        />
    );
};

export default NumberLookupEditCell;