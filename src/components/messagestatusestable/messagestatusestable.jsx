import { useState, useEffect } from "react";
import { DataGrid } from "devextreme-react";
import { Column } from "devextreme-react/data-grid";
import pageText from './messagestatusestable-text.json'

const codeToStr = codeNum => {
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
            return `${codeNum}`;
    }
};

const processMessageStatuses = (msgStatuses, selectedContacts) => {
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
};

const MessageStatusesTable = ({msgStatuses, selectedContacts}) => {
    const [processedMsgStatuses, setProcessedMsgStatuses] = useState([]);
    useEffect(() => {
        setProcessedMsgStatuses(processMessageStatuses(msgStatuses, selectedContacts));
    }, [msgStatuses, selectedContacts]);

    return (
        <DataGrid
            dataSource={processedMsgStatuses}
            keyExpr="id"
        >
            <Column
                dataField='contactName'
                dataType='string'
                caption={pageText.CONTACT_NAME}
            />
            <Column
                dataField='schoolName'
                dataType='string'
                caption={pageText.SCHOOL_NAME}
            />
            <Column
                dataField='msg1'
                dataType='string'
                caption={pageText.MSG1}
            />
            <Column
                dataField='msg2'
                dataType='string'
                caption={pageText.MSG2}
            />
            <Column
                dataField='msg3'
                dataType='string'
                caption={pageText.MSG3}
            />
            <Column
                dataField='generalFail'
                dataType='string'
                caption={pageText.GENERAL_FAIL}
            />
        </DataGrid>
    );
};

export default MessageStatusesTable;