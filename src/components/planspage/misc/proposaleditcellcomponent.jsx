import React, { useState, useContext } from "react";
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import { uploadProposalToDrive } from '../../../utils/localServerRequests';
import { ColorRing } from "react-loader-spinner";
import pageText from '../planspage-text.json';

/**
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnEditCellTemplateData} props.data Data prop
 */
const ProposalEditCellComponent = ({ data }) => {
    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;

    const [isLoading, setIsLoading] = useState(false);

    const plan = data.data;
    const school = storeLookupData.schools.get(plan.schoolId);

    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    const onChangeFile = event => {
        if (!(plan.year && plan.district && school && school.city && school.name)) {
            alert(pageText.notEnoughParameters);
            return;
        }
        (async () => {
            setIsLoading(true);
            const drive_link = await uploadProposalToDrive(
                event.target.files[0], plan.year, plan.district,
                school.city, school.name
            );
            setIsLoading(false);
            if (drive_link) {
                data.setValue(`V#${drive_link}#`);
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
            onChange={onChangeFile}
        />
    );
};

export default ProposalEditCellComponent;