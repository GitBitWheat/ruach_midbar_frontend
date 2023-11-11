import React, { useContext } from "react";
import { SchoolsContext } from '../../../store/SchoolsContextProvider';
import pageText from '../planspage-text.json';
import { uploadProposalToDrive } from '../../../utils/localServerRequests';

const ProposalEditCellComponent = ({ data }) => {
    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;

    const plan = data.data;
    const school = storeLookupData.schools.get(plan.schoolId);

    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    const onChangeFile = event => {
        if (!(plan.year && plan.district && school && school.city && school.name)) {
            alert(pageText.notEnoughParameters);
            return;
        }
        (async () => {
            const drive_link = await uploadProposalToDrive(
                event.target.files[0], plan.year, plan.district,
                school.city, school.name
            );
            if (drive_link) {
                data.setValue(`V#${drive_link}#`);
            } else {
                alert(pageText.proposalUploadFailed);
            }
        })();
    };

    return (
        <input
            type="file"
            onChange={onChangeFile}
        />
    );
};

export default ProposalEditCellComponent;