import { useContext } from "react";
import { SchoolsContext } from "../../store/SchoolsContextProvider";
import { deleteGoogleContactRequest, updateGoogleContactRequest, uploadToGoogleContacts }
    from '../../utils/localServerRequests';
import { Button } from 'devextreme-react';
import pageText from '../../components/schoolspage/schoolspagetext.json';
import './usegooglecontactactions.css';

const noGoogleContactButtonRender = () => (
    <span className='dataError'>
        {pageText.noGoogleContact}
    </span>
);
const deleteGoogleContactOnlyButtonRender = () => (
    <span>X</span>
);

const useGoogleContactActions = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    const addGoogleContactForExistingContact = (contactId, contact) => async () => {
        const school = storeLookupData.schools.get(contact.schoolId);
        if (contact.firstName && contact.role && contact.phone &&
            school && school.level && school.name && school.city) {
            const googleContactData = await uploadToGoogleContacts(
                `${contact.firstName} ${contact.role} ${school.level} ${school.name} ${school.city}`,
                contact.phone
            );
            if (googleContactData) {
                contact.googleContactsResourceName = googleContactData.resourceName;
                storeMethods.updateContact(
                    contactId,
                    {...contact, googleContactsResourceName: googleContactData.resourceName}
                );
            } else {
                alert(pageText.failedUploadGoogleContact);
            }
        } else {
            alert(pageText.notEnoughParameters);
        }
    };

    const removeOnlyGoogleContact = (contactId, contact) => async () => {
        if (contact.googleContactsResourceName) {
            if (await deleteGoogleContactRequest(
                    contact.googleContactsResourceName.replace('people/', '')
                )) {
                storeMethods.updateContact(
                    contactId,
                    {...contact, googleContactsResourceName: null}
                );
            } else {
                alert(pageText.failedDeleteGoogleContact);
            }
        }
    };

    const resourceNameCellRender = ({ value, key, data }) => value ? (
        <span>
            <a
                href={`https://contacts.google.com/person/${value.replace('people/', '')}`}
                target='_blank'
                rel='noreferrer'
            >
                {pageText.googleContactsLink}
            </a>
            &nbsp;&nbsp;
            <Button
                render={deleteGoogleContactOnlyButtonRender}
                onClick={removeOnlyGoogleContact(key, data)}
                className='noPaddingButton'
            />
        </span>
    ) : (
        <Button
            render={noGoogleContactButtonRender}
            onClick={addGoogleContactForExistingContact(key, data)}
            className='noPaddingButton'
        />
    );

    const addContactGoogleAndStore = async (contact, school) => {
        if (contact.firstName && contact.role && contact.phone &&
            school && school.level && school.name && school.city) {
            const googleContactData = await uploadToGoogleContacts(
                `${contact.firstName} ${contact.role} ${school.level} ${school.name} ${school.city}`,
                contact.phone
            );
            if (googleContactData) {
                return await storeMethods.addContact(
                    {...contact, googleContactsResourceName: googleContactData.resourceName}
                );
            } else {
                alert(pageText.failedUploadGoogleContact);
                return await storeMethods.addContact(contact);
            }
        } else {
            alert(pageText.notEnoughParameters);
            return await storeMethods.addContact(contact);
        }
    };

    const deleteContactGoogleAndStore = async (contactId, resourceName) => {
        if (resourceName) {
            if (!await deleteGoogleContactRequest(resourceName.replace('people/', ''))) {
                alert(pageText.failedDeleteGoogleContact);
            }
        }
        return await storeMethods.deleteContact(contactId);
    };

    const updateContactGoogleAndStore = async (contactId, contact, school) => {
        if (contact.googleContactsResourceName && contact.firstName && contact.role && contact.phone &&
            school && school.level && school.name && school.city) {
            if (!await updateGoogleContactRequest(
                    contact.googleContactsResourceName.replace('people/', ''),
                    `${contact.firstName} ${contact.role} ${school.level} ${school.name} ${school.city}`,
                    contact.phone
                )) {
                alert(pageText.failedUpdateGoogleContact);
            }
        }
        return await storeMethods.updateContact(contactId, contact);
    };

    return [resourceNameCellRender, addContactGoogleAndStore,
        deleteContactGoogleAndStore, updateContactGoogleAndStore];
};

export default useGoogleContactActions;