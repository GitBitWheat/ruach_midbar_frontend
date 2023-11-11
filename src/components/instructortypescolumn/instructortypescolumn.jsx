import { Column, Lookup } from "devextreme-react/data-grid";
import instructorTypes from '../../static/instructor_types.json';
import InstructorTypesTagBoxComponent from "./instructorTypesTagBoxComponent";
import settingsConstants from '../../utils/settingsconstants.json';
import pageText from './instructortypescolumntext.json';

const instTypesHeaderFilterDs = instructorTypes.map(instType => ({
    text: instType.text,
    value: ['instructorTypes', 'contains', instType.value]
}));

const calculateFilterExpression = (filterValue, _selectedFilterOperation, target) => {
    if (target === 'search' && typeof (filterValue) === 'string') {
        return ['instructorTypes', 'contains', filterValue];
    }
    return function(data) {
        return (data.instructorTypes || []).indexOf(filterValue) !== -1;
    };
};

const instTypesDisplayValue = data => (data.instructorTypes || []).join(', ');

const InstructorTypesColumn = (key, addedProps) => {
    const extraProps = {...addedProps};
    if (key) {
        extraProps.key = key;
    }

    return (
        <Column
            dataField="instructorTypes"
            dataType="object"
            caption={pageText.instructorTypes}
            editCellComponent={InstructorTypesTagBoxComponent}
            calculateDisplayValue={instTypesDisplayValue}
            calculateFilterExpression={calculateFilterExpression}
            allowSorting={false}
            headerFilter={{ dataSource: instTypesHeaderFilterDs }}
            width={250}
            {...extraProps}
        >
            <Lookup
                dataSource={{
                    store: instructorTypes,
                    paginate: true,
                    pageSize: settingsConstants.columnLookupPageSize
                }}
                valueExpr="value"
                displayExpr="text"
            />
        </Column>
    );
};



export default InstructorTypesColumn;