import axios from "axios";



axios.defaults.xsrfHeaderName = 'x-csrftoken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.withCredentials = true;

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.timeout = 30000;

const api = axios.create();



export function messagesRequest(msg1 = null, msg2 = null, msg3 = null, phones, names, status, schoolIds, contactIds, isRepLst, setMsgStatuses) {
    if (names === null) {
        names = [];
        for (let i = 0; i < phones.length; ++i) {
            names.push('');
        }
    }
    if (schoolIds === null) {
        schoolIds = [];
        for (let i = 0; i < phones.length; ++i) {
            schoolIds.push(null);
        }
    }
    if (contactIds === null) {
        contactIds = [];
        for (let i = 0; i < phones.length; ++i) {
            contactIds.push(null);
        }
    }
    if (isRepLst === null) {
        isRepLst = [];
        for (let i = 0; i < phones.length; ++i) {
            isRepLst.push(null);
        }
    }



    if (msg1 === '') {
        msg1 = null;
    }
    if (msg2 === '') {
        msg2 = null;
    }
    if (msg3 === '') {
        msg3 = null;
    }

    const data = {
        msg1: msg1,
        msg2: msg2,
        msg3: msg3,
        phones: phones,
        names: names,
        status: status,
        schoolIds: schoolIds,
        contactIds: contactIds,
        isRepLst: isRepLst
    };

    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
        'Content-Type': 'application/json'
        },
        timeout: 3 * 3600 * 1000 //3 hours
    };
    api.post('http://localhost:8000/sendmessages/', serializedData, config)
        .then((response) => {
            setMsgStatuses(response.data.msg_statuses);
        })
}



export function getDataRequest(setter) {
    axios.get('http://localhost:8000/getdata/')
        .then((response) => {
            setter(response.data);
        })
}



export function addMsgPatternRequest(msg1, msg2, msg3, title, process) {
    const data = {
        msg1: msg1,
        msg2: msg2,
        msg3: msg3,
        title: title
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    api.post('http://localhost:8000/addmsgpattern/', serializedData, config)
        .then((response) => {
            process(response.data.id);
        })
}

export function deleteMsgPatternRequest(msgId) {
    api.delete(`http://localhost:8000/deletemsgpattern/${msgId}/`)
        .then((_) => {
            console.log(`Successfully deleted message pattern ${msgId}`);
        })
}



// Sending request to place an instructor, and processing the response (id of the new placement)
export async function addInstructorPlacementRequest(instructorId, planId) {
    const data = {
        instructorId: instructorId,
        planId: planId
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    
    try {
        await api.post(
            'http://localhost:8000/addinstructorplacement/',
            serializedData, config
        );
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Canceling placement of an instructor
export async function deleteInstructorPlacementRequest(instructorId, planId) {
    try {
        await api.delete(
            `http://localhost:8000/deleteinstructorplacement/${instructorId}/${planId}/`
        );
        console.log(`Successfully canceled instructor placement ${instructorId}, ${planId}`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}



// Seding request to set colors associated with an instructor and a plan
export function addInstructorPlanColorRequest(instructorId, planId, colorId) {
    const data = {
        instructorId: instructorId,
        planId: planId,
        colorId: colorId
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    api.post('http://localhost:8000/addinstructorplancolor/', serializedData, config);
}

export function updateInstructorPlanColorRequest(instructorId, planId, colorId) {
    const data = {
        instructorId: instructorId,
        planId: planId,
        colorId: colorId
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    api.post('http://localhost:8000/updateinstructorplancolor/', serializedData, config);
}

// Canceling placement of an instructor
export function deleteInstructorPlanColorRequest(instructorId, planId) {
    api.delete(`http://localhost:8000/deleteinstructorplancolor/${instructorId}/${planId}/`)
        .then((_) => {
            console.log(`Successfully deleted instructor ${instructorId} plan ${planId} color`);
        })
}

// Updating default message of a plan
export async function updatePlanMessageRequest(planId, msg) {
    const data = {
        planId: planId,
        msg: msg
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    try {
        await api.post('http://localhost:8000/updateplanmsgrequest/', serializedData, config);
        return true;
    } catch(err) {
        console.log(err);
        return false;
    }
}



// Updating selected instructor query buttons for each plan
export function addPlanButtonsRequest(planId, buttons) {
    const data = {
        planId: planId,
        buttons: buttons
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    api.post('http://localhost:8000/addplanbuttons/', serializedData, config);
}

export function deletePlanButtonsRequest(planId, buttons) {
    const data = {
        planId: planId,
        buttons: buttons
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    api.post('http://localhost:8000/deleteplanbuttons/', serializedData, config);
}

// Updating the candidates that have been placed to a plan
export async function updatePlanPlacedCandidatesRequest(planId, instructor1, instructor2, instructor3, instructor4) {
    const data = {
        planId: planId,
        instructor1: instructor1 !== null ? instructor1 : '',
        instructor2: instructor2 !== null ? instructor2 : '',
        instructor3: instructor3 !== null ? instructor3 : '',
        instructor4: instructor4 !== null ? instructor4 : ''
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    try {
        await api.post('http://localhost:8000/updateplanplacedcandidates/', serializedData, config);
        return true;
    } catch(err) {
        console.log(err);
        return false;
    }
}


export function updateInstructorNotesRequest(instructorId, notes) {
    const data = {
        instructorId: instructorId,
        notes: notes
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    api.post('http://localhost:8000/updateinstructornotes/', serializedData, config);
}



export async function addInstructorRequest(data) {
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    
    try {
        const response = await api.post('http://localhost:8000/addinstructor/', serializedData, config);
        return response.data.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}



export async function deleteInstructorRequest(instructorId) {
    try {
        await api.delete(`http://localhost:8000/deleteinstructor/${instructorId}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}



export async function updateInstructorRequest(instructorId, instructorData) {
    const data = {
        id: instructorId,
        recordData: instructorData
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        await api.post('http://localhost:8000/updateinstructor/', serializedData, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}



export async function uploadFileToDrive(file) {
    const formData = new FormData();
    formData.append('file', file);
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };
    try {
        const response =
            await api.post('http://localhost:8000/uploadfiletodrive/', formData, config);
        console.log(response);
        return response.data.drive_link;
    } catch (error) {
        console.error(error);
        return null;
    }
}



export async function uploadInstructorFileToDrive(file, area, city, name, dirName) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('area', area);
    formData.append('city', city);
    formData.append('name', name);
    formData.append('dir_name', dirName);
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };
    try {
        const response =
            await api.post('http://localhost:8000/uploadinstructorfiletodrive/', formData, config);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function uploadInstructorFileToDriveMultiple(file, area, city, name, dirName) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('area', area);
    formData.append('city', city);
    formData.append('name', name);
    formData.append('dir_name', dirName);
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };
    try {
        const response =
            await api.post('http://localhost:8000/uploadinstructorfiletodrivemultiple/',
            formData, config);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteDriveFileRequest(fileId) {
    try {
        await api.delete(`http://localhost:8000/deletedrivefile/${fileId}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function listInstructorFiles(area, city, name, dirNames) {
    const data = {
        area: area,
        city: city,
        name: name,
        dirNames: dirNames
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        const response = await api.post(
            'http://localhost:8000/listinstructorfiles/', serializedData, config
        );
        console.log(response);
        return response.data.instructorFiles;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getDistanceRequest(origin) {
    const data = {
        origin: origin,
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    try {
        const response = await api.post(
            'http://localhost:8000/city_distances/', serializedData, config
        );
        return response.data.dists;
    } catch (error) {
        console.error(error);
        return null;
    }
}



// Update data of school
export async function updateSchoolRequest(schoolId, schoolData) {
    const data = {
        schoolId: schoolId,
        schoolData: schoolData
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    
    try {
        await api.post('http://localhost:8000/updateschool/', serializedData, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

//schoolName, level, sector, schoolType, city, representative, status
export async function addSchoolRequest(data) {
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        const response = await api.post('http://localhost:8000/addschool/', serializedData, config);
        return response.data.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}



export async function deleteSchoolRequest(schoolId) {
    try {
        await api.delete(`http://localhost:8000/deleteschool/${schoolId}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}


// Add and update contact
export async function updateContactRequest(contactId, contactData) {
    const data = {
        contactId: contactId,
        contactData: contactData
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        await api.post('http://localhost:8000/updatecontact/', serializedData, config);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}



export async function addContactRequest(data) {
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        const response = await api.post('http://localhost:8000/addcontact/', serializedData, config);
        return response.data.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteContactRequest(contactId) {
    try {
        await api.delete(`http://localhost:8000/deletecontact/${contactId}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}



export async function uploadToGoogleContacts(name, phone) {
    const data = {
        name: name,
        phone: phone
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        const response = await api.post('http://localhost:8000/uploadgooglecontact/', serializedData, config);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateGoogleContactRequest(resourceName, name, phone) {
    const data = {
        resourceName: resourceName,
        name: name,
        phone: phone
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        await api.post('http://localhost:8000/updategooglecontact/', serializedData, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function deleteGoogleContactRequest(resourceName) {
    try {
        await api.delete(`http://localhost:8000/deletegooglecontact/${resourceName}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function uploadProposalToDrive(proposalFile, year, district, city, school) {
    const formData = new FormData();
    formData.append('proposalFile', proposalFile);
    formData.append('year', year);
    formData.append('district', district);
    formData.append('city', city);
    formData.append('school', school);
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };
    try {
        const response = await api.post('http://localhost:8000/uploadproposaltodrive/', formData, config);
        console.log(response);
        return response.data.drive_link;
    } catch (error) {
        console.error(error);
        return null;
    }
}



export async function addPaymentRequest(data) {
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        const response = await api.post('http://localhost:8000/addpayment/', serializedData, config);
        return response.data.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}



export async function updatePaymentRequest(paymentId, paymentData) {
    const data = {
        id: paymentId,
        recordData: paymentData
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        await api.post('http://localhost:8000/updatepayment/', serializedData, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}



export async function deletePaymentRequest(paymentId) {
    try {
        await api.delete(`http://localhost:8000/deletepayment/${paymentId}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function updateInvitationRequest(invitationId, invitationData) {
    const data = {
        id: invitationId,
        recordData: invitationData
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        await api.post('http://localhost:8000/updateinvitation/', serializedData, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function addInvitationRequest(data) {
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        const response = await api.post('http://localhost:8000/addinvitation/', serializedData, config);
        return response.data.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteInvitationRequest(invitationId) {
    try {
        await api.delete(`http://localhost:8000/deleteinvitation/${invitationId}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}



// Update plans data
export async function addPlanRequest(data) {
	console.log('DB - addPlanRequest');
    const serializedData = JSON.stringify(data);
    const config = { 
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        const response = await api.post('http://localhost:8000/addplan/', serializedData, config);
		console.log('DB - addPlanRequest response: ', response.data);
        return response.data.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updatePlanRequest(planId, planData) {
    const data = {
        id: planId,
        recordData: planData
    };
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        await api.post('http://localhost:8000/updateplan/', serializedData, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}



export async function deletePlanRequest(planId) {
    try {
        await api.delete(`http://localhost:8000/deleteplan/${planId}/`);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}



export async function updateSettingsRequest(data) {
    const serializedData = JSON.stringify(data);
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };

    try {
        await api.post('http://localhost:8000/updatesettings/', serializedData, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function updatePeopleCreds() {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    try {
        await api.post('http://localhost:8000/updatepeoplecreds/', {}, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};
export async function updateInstructorsCreds() {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    try {
        await api.post('http://localhost:8000/updateinstructorscreds/', {}, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};
export async function updateProposalCreds() {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 60 * 1000 // 60 seconds
    };
    try {
        await api.post('http://localhost:8000/updateproposalcreds/', {}, config);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};