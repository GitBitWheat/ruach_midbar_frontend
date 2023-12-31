import { useState } from "react";
import { uploadInstructorFileToDrive } from "../../../utils/localServerRequests";
import { ColorRing } from "react-loader-spinner";
import pageText from '../instructorspagetext.json';

/**
 * @param {Object} props
 * @param {import('devextreme/ui/data_grid').ColumnEditCellTemplateData} props.data
 */
const FileEditCellComponent = ({ data }) => {
    const [isLoading, setIsLoading] = useState(false);

    const instructor = data.data;
    const instructorDirName =
        data.data.firstName.split('#')[0] + (data.data.lastName ? ' ' + data.data.lastName : '');

    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    const FileChangeHandler = event => {
        if (!(instructor.area && instructor.city && instructor.firstName && instructorDirName)) {
            alert(pageText.notEnoughParameters);
            return;
        }
        (async () => {
            setIsLoading(true);
            const file_metadata = await uploadInstructorFileToDrive(
                event.target.files[0],
                instructor.area, instructor.city,
                instructorDirName,
                data.column.dataField
            );
            setIsLoading(false);
            if (file_metadata) {
                data.setValue(`${data.column.caption}#${file_metadata.drive_link}#`);
                data.component.repaint();
            } else {
                alert(pageText.proposalUploadFailed);
            }
        })();
    };
    
    return isLoading ? (
        <ColorRing
            visible={true}
            wrapperClass="blocks-wrapper"
            colors={['#000000']}
            height={25}
            width={25}
        />
    ) : (
        <input
            type="file"
            onChange={FileChangeHandler}
        />
    );
};

export default FileEditCellComponent;