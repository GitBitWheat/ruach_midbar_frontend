import { useCallback } from 'react';
import TagBox from 'devextreme-react/tag-box';
import InstructorTypes from '../../static/instructor_types.json';
import pageText from './instructortypescolumntext.json';

const nameLabel = { 'aria-label': 'Name' };

const InstructorTypesTagBoxComponent = ({ data }) => {

    const onValueChanged = useCallback((event) => {
        data.setValue(event.value);
    }, [data]);

    const onSelectionChanged = useCallback(() => {
        data.component.updateDimensions();
    }, [data]);

    return (
        <TagBox
            dataSource={InstructorTypes}
            defaultValue={data.value}
            valueExpr="value"
            displayExpr="text"
            showSelectionControls={true}
            maxDisplayedTags={3}
            inputAttr={nameLabel}
            showMultiTagOnly={false}
            applyValueMode="useButtons"
            searchEnabled={true}
            onValueChanged={onValueChanged}
            onSelectionChanged={onSelectionChanged}
            rtlEnabled={true}
            placeholder={pageText.select}
        />
    );
}

export default InstructorTypesTagBoxComponent;