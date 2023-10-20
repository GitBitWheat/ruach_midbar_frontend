import { useCallback } from "react";
import { NumberBox } from "devextreme-react";

/**
 * Numeric value custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnCellTemplateData} props.data Data prop
 */
const NumberEditCell = ({ data }) => {

    const onValueChanged = useCallback(event => {
        data.setValue(event.value);
    }, [data]);

    return (
        <NumberBox
            defaultValue={data.value}
            showSpinButtons={true}
            showClearButton={true}
            onValueChanged={onValueChanged}
            rtlEnabled={true}
        />
    );
};

export default NumberEditCell;