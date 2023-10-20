import { useMemo } from "react";

import uuid from 'react-uuid';

import DataTable from "../datatable/datatable";

import pageText from './messagestatusestable-text.json'



const msgStatusesTableColumns = [
    {id: uuid(), field: "contactName", header: pageText.CONTACT_NAME},
    {id: uuid(), field: "schoolName", header: pageText.SCHOOL_NAME},
    {id: uuid(), field: "msg1", header: pageText.MSG1},
    {id: uuid(), field: "msg2", header: pageText.MSG2},
    {id: uuid(), field: "msg3", header: pageText.MSG3},
    {id: uuid(), field: "generalFail", header: pageText.GENERAL_FAIL},
];

function codeToStr(codeNum) {
    switch(codeNum) {
        case 1:
            return pageText.SUCCESSFUL;
        case 2:
            return pageText.COULD_NOT_SEND;
        case 3:
            return pageText.WRONG_PHONE;
        case 4:
            return pageText.FAILED_SENDING_VALIDATION;
        case 5:
            return pageText.INVALID_INPUT;
        case 6:
            return pageText.COULD_NOT_LOAD_PAGE;
        default:
            return codeNum;
    }
}

function processMessageStatuses (msgStatuses, selectedContacts) {
    return msgStatuses.map((statuses, idx) =>
        [statuses, selectedContacts[idx]]
    ).filter(([statuses, _]) =>
        !(typeof statuses === 'object' && Object.values(statuses).every(status => status === 1 || status === null))
    ).map(([statuses, contact]) => {
        const statusObj = {
            id: contact.id,
            contactName: contact.firstName,
            schoolName: contact.schoolName,
            msg1: null,
            msg2: null,
            msg3: null,
            generalFail: null
        };
        if (typeof statuses === 'object') {
            statusObj.msg1 = codeToStr(statuses.msg1);
            statusObj.msg2 = codeToStr(statuses.msg2);
            statusObj.msg3 = codeToStr(statuses.msg3);
        }
        else {
            statusObj.generalFail = codeToStr(statuses);
        }
        return statusObj;
    });
}



const MessageStatusesTable = ({msgStatuses, selectedContacts}) => {
    const processedMsgStatuses = useMemo(() => processMessageStatuses(msgStatuses, selectedContacts), [msgStatuses, selectedContacts]);

    return (
        <DataTable
            name="msgStatuses"
            rows={processedMsgStatuses}
            columns={msgStatusesTableColumns}
        />
    );
};

export default MessageStatusesTable;