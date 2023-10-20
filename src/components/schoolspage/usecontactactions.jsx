import { useContext, useCallback } from "react";
import { SchoolsContext } from "../../store/SchoolsContextProvider";
import { deleteGoogleContactRequest, updateGoogleContactRequest, uploadToGoogleContacts } from '../../utils/localServerRequests';
import { Button } from 'devextreme-react';
import pageText from './schoolspagetext.json';
import './schoolspage.css';

const noGoogleContactButtonRender = () => (
    <span className='dataError'>
        {pageText.noGoogleContact}
    </span>
);
const deleteGoogleContactOnlyButtonRender = () => (
    <span>X</span>
);

const useContactActions = () => {

    const storeCtx = useContext(SchoolsContext);
    const storeLookupData = storeCtx.lookupData;
    const storeMethods = storeCtx.methods;

    const addGoogleContactForExistingContact = useCallback((contactId, contact) => async () => {
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
    }, [storeMethods, storeLookupData.schools]);

    const removeOnlyGoogleContact = useCallback((contactId, contact) => async () => {
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
    }, [storeMethods]);

    const resourceNameCellRender = useCallback(({ value, key, data }) => value ? (
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
    ), [addGoogleContactForExistingContact, removeOnlyGoogleContact]);

    const addContactGoogleAndStore = useCallback(async (contact, school) => {
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
    }, [storeMethods]);

    const deleteContactGoogleAndStore = useCallback(async (contactId, resourceName) => {
        if (resourceName) {
            if (!await deleteGoogleContactRequest(resourceName.replace('people/', ''))) {
                alert(pageText.failedDeleteGoogleContact);
            }
        }
        return await storeMethods.deleteContact(contactId);
    }, [storeMethods]);

    const updateContactGoogleAndStore = useCallback(async (contactId, contact, school) => {
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
    }, [storeMethods]);

    return [resourceNameCellRender, addContactGoogleAndStore,
        deleteContactGoogleAndStore, updateContactGoogleAndStore];
};

export default useContactActions;