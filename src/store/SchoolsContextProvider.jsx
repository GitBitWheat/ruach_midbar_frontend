import { createContext, useEffect, useState, useCallback } from 'react';
import { getDataRequest, addMsgPatternRequest, deleteMsgPatternRequest, addInstructorPlacementRequest, deleteInstructorPlacementRequest,
    addInstructorPlanColorRequest, updateInstructorPlanColorRequest, deleteInstructorPlanColorRequest, updatePlanMessageRequest,
    addPlanButtonsRequest, deletePlanButtonsRequest, updatePlanPlacedCandidatesRequest, updateInstructorNotesRequest, addInstructorRequest,
    deleteInstructorRequest, updateInstructorRequest, updateSchoolRequest, addSchoolRequest, deleteSchoolRequest, updateContactRequest, addContactRequest,
    deleteContactRequest, addPaymentRequest, updatePaymentRequest, deletePaymentRequest, addInvitationRequest, updateInvitationRequest, deleteInvitationRequest,
    addPlanRequest, updatePlanRequest, deletePlanRequest, updateSettingsRequest }
    from '../utils/localServerRequests';



const SchoolsContext = createContext();

const SchoolsContextProvider = ({ children }) => {
    const [schools, setSchools] = useState([]);
    const [levels, setLevels] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [schoolTypes, setSchoolTypes] = useState([]);
    const [cities, setCities] = useState([]);
    const [schoolStatuses, setSchoolStatuses] = useState([]);
    const [contactStatuses, setContactStatuses] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [messages, setMessages] = useState([{msg1: '', msg2: '', msg3: '', title: ''}]);
    const [plans, setPlans] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [instructorPlacements, setInstructorPlacements] = useState([]);
    const [colors, setColors] = useState([]);
    const [instructorPlanColors, setInstructorPlanColors] = useState([]);
    const [planButtons, setPlanButtons] = useState([]);
    const [planYears, setPlanYears] = useState([]);
    const [planStatuses, setPlanStatuses] = useState([]);
    const [planInvitations, setPlanInvitations] = useState([]);
    const [planDistricts, setPlanDistricts] = useState([]);
    const [planPlans, setPlanPlans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [settings, setSettings] = useState({});

    const [schoolsLU, setSchoolsLU] = useState(new Map());

    const data = {
        schools: schools,
        levels: levels,
        sectors: sectors,
        schoolTypes: schoolTypes,
        cities: cities,
        schoolStatuses: schoolStatuses,
        contactStatuses: contactStatuses,
        contacts: contacts,
        roles: roles,
        messages: messages,
        plans: plans,
        instructors: instructors,
        instructorPlacements: instructorPlacements,
        colors: colors,
        instructorPlanColors: instructorPlanColors,
        planButtons: planButtons,
        planYears: planYears,
        planStatuses: planStatuses,
        planInvitations: planInvitations,
        planDistricts: planDistricts,
        planPlans: planPlans,
        payments: payments,
        invitations: invitations,
        settings: settings
    };

    const lookupData = {
        schools: schoolsLU
    };



    // Adding and deleting a message pattern
    const addMessagePattern = useCallback((msg1, msg2, msg3, title) => {
        addMsgPatternRequest(msg1, msg2, msg3, title, newId => {
            setMessages([{
                id: newId,
                msg1: msg1,
                msg2: msg2,
                msg3: msg3,
                title: title
            }].concat(messages));
        });
    }, [messages]);

    const deleteMessagePattern = useCallback(msgId => {
        deleteMsgPatternRequest(msgId);
        setMessages(messages.filter(message => message.id !== msgId));
    }, [messages]);

    // Placing and canceling placement of an school
    const addInstructorPlacement = useCallback(async (instructorId, planId) => {
        const success = await addInstructorPlacementRequest(instructorId, planId);
        if (success) {
            setInstructorPlacements([{
                instructorId: instructorId,
                planId: planId
            }].concat(instructorPlacements));
        }
        return success;
    }, [instructorPlacements]);

    const deleteInstructorPlacement = useCallback(async (instructorId, planId) => {
        const success = await deleteInstructorPlacementRequest(instructorId, planId);
        if (success) {
            setInstructorPlacements(
                instructorPlacements
                .filter(placement => placement.instructorId !== instructorId || placement.planId !== planId)
            );
        }
        return success;
    }, [instructorPlacements]);

    // Changing colored status of an school and plan
    const addInstructorPlanColor = useCallback((instructorId, planId, colorId) => {
        addInstructorPlanColorRequest(instructorId, planId, colorId);
        setInstructorPlanColors([{
            instructorId: instructorId,
            planId: planId,
            colorId: colorId
        }].concat(instructorPlanColors));
    }, [instructorPlanColors]);

    const deleteInstructorPlanColor = useCallback((instructorId, planId) => {
        deleteInstructorPlanColorRequest(instructorId, planId);
        setInstructorPlanColors(instructorPlanColors.filter(ipColor =>
            ipColor.instructorId !== instructorId || ipColor.planId !== planId));
    }, [instructorPlanColors]);

    const updateInstructorPlanColor = useCallback((instructorId, planId, colorId) => {
        updateInstructorPlanColorRequest(instructorId, planId, colorId);
        setInstructorPlanColors(instructorPlanColors.map(ipColor =>
            instructorId === ipColor.instructorId && planId === ipColor.planId ? {...ipColor, colorId: colorId} : ipColor));
    }, [instructorPlanColors]);

    // Updating colored status of school and plan
    const updateColorOfColoredStatus = useCallback((colorId, hex) => {
        setColors(colors.map(color => colorId === color.id ? {...color, hex: hex} : color));
    }, [colors]);

    const updateDescOfColoredStatus = useCallback((colorId, desc) => {
        setColors(colors.map(color => colorId === color.id ? {...color, desc: desc} : color));
    }, [colors]);

    // Update plan message
    const updatePlanMessage = useCallback(async (planId, msg) => {
        const success = await updatePlanMessageRequest(planId, msg);
        if (success) {
            setPlans(plans.map(plan => planId === plan.id ? {...plan, msg: msg} : plan));
        }
        return success;
    }, [plans]);

    // Adding and deleting a clicked query button for each plan
    const addPlanButtons = useCallback((planId, buttons) => {
        addPlanButtonsRequest(planId, buttons);
        const newPlanButtons = buttons.map(button => ({
            planId: planId,
            button: button
        }));
        setPlanButtons(newPlanButtons.concat(planButtons));
    }, [planButtons]);

    const deletePlanButtons = useCallback((planId, buttons) => {
        deletePlanButtonsRequest(planId, buttons);
        setPlanButtons(planButtons.filter(pb => pb.planId !== planId || !buttons.includes(pb.button)));
    }, [planButtons]);

    // Updating the candidates that have been placed to a plan
    const placeCandidates = useCallback(async (planId, instructorNames, instructorNum) => {
        const plan = plans.find(plan => plan.id === planId);
        const newPlan = {...plan};
        for (let i = 0; i < instructorNames.length; ++i) {
            newPlan[`instructor${instructorNum + i}`] = instructorNames[i];
        }

        const success = await updatePlanPlacedCandidatesRequest(planId, newPlan.instructor1,
            newPlan.instructor2, newPlan.instructor3, newPlan.instructor4);
        if (success) {
            setPlans(plans.map(plan => plan.id === planId ? newPlan : plan));
        }
        return success;
    }, [plans]);

    const cancelCandidatePlacement = useCallback((planId, instructorNum) => {
        const plan = plans.find(plan => plan.id === planId);
        const newPlan = {...plan};
        for (let i = 0; i <= 4 - instructorNum; ++i) {
            newPlan[`instructor${instructorNum + i}`] = plan[`instructor${instructorNum + i + 1}`];
        }
        newPlan.instructor4 = null;

        const success = updatePlanPlacedCandidatesRequest(planId, newPlan.instructor1,
            newPlan.instructor2, newPlan.instructor3, newPlan.instructor4);
        if (success) {
            setPlans(plans.map(plan => plan.id === planId ? newPlan : plan));
        }
        return success;
    }, [plans]);

    // Updating the notes field of an school
    const updateInstructorNotes = useCallback((instructorId, notes) => {
        updateInstructorNotesRequest(instructorId, notes);
        setInstructors(instructors.map(school => school.id === instructorId ? {...school, notes: notes} : school));
    }, [instructors]);

    // Update data on an school
    const addInstructor = useCallback(async instructor => {
        const instructorId = await addInstructorRequest(instructor);
        if (instructorId) {
            setInstructors([{
                ...instructor,
                id: instructorId,
                instructorTypes: Object.entries(instructor.instructorTypes)
                .filter(([_type, isSelected]) => isSelected).map(([type, _isSelected]) => type)
            }].concat(instructors));
            return true;
        } else {
            return false;
        }
    }, [instructors]);

    const deleteInstructor = useCallback(async instructorId => {
        const success = await deleteInstructorRequest(instructorId);
        if (success) {
            setInstructors(instructors.filter(school => school.id !== instructorId));
        }
        return success;
    }, [instructors]);

    const updateInstructor = useCallback(async (instructorId, instructorData) => {
        const success = await updateInstructorRequest(instructorId, instructorData);
        if (success) {
            setInstructors(instructors.map(school => school.id === instructorId ? {
                ...instructorData,
                instructorTypes: Object.entries(instructorData.instructorTypes)
                                .filter(([_type, isSelected]) => isSelected)
                                .map(([type, _isSelected]) => type)
            } : school));
        }
        return success;
    }, [instructors]);

    // Update data of a school
    const updateSchool = useCallback(async (schoolId, schoolData) => {
        const success = await updateSchoolRequest(schoolId, schoolData);
        if (success) {
            setSchools(schools.map(school => school.id === schoolId ? schoolData : school));
            setSchoolsLU(new Map(schoolsLU.set(schoolId, schoolData)));
        }
        return success;
    }, [schools, schoolsLU]);

    const addSchool = useCallback(async schoolData => {
        const schoolId = await addSchoolRequest(schoolData);
        if (schoolId) {
            const schoolDataWithId = {
                ...schoolData,
                id: schoolId,
            };
            setSchools([schoolDataWithId].concat(schools));
            setSchoolsLU(new Map(schoolsLU.set(schoolId, schoolDataWithId)));
            return true;
        } else {
            return false;
        }
    }, [schools, schoolsLU]);

    const deleteSchool = useCallback(async schoolId => {
        const success = await deleteSchoolRequest(schoolId);
        if (success) {
            setSchools(schools.filter(school => school.id !== schoolId));
            const newSchoolsLU = new Map(schoolsLU);
            newSchoolsLU.delete(schoolId);
            setSchoolsLU(newSchoolsLU);
        }
        return success;
    }, [schools, schoolsLU]);

    // Update data of a contact
    const updateContact = useCallback(async (contactId, contactData) => {
        const success = await updateContactRequest(contactId, contactData);
        if (success) {
            setContacts(contacts.map(contact => contact.id === contactId ? contactData : contact));
        }
        return success;
    }, [contacts]);

    const addContact = useCallback(async contactData => {
        const contactId = await addContactRequest(contactData);
        if (contactId) {
            setContacts([{
                ...contactData,
                id: contactId,
            }].concat(contacts));
            return true;
        } else {
            return false;
        }
    }, [contacts]);

    const deleteContact = useCallback(async contactId => {
        const success = await deleteContactRequest(contactId);
        if (success) {
            setContacts(contacts.filter(contact => contact.id !== contactId));
        }
        return success;
    }, [contacts]);

    // Update payments data
    const addPayment = useCallback(async payment => {
        const paymentId = await addPaymentRequest(payment);
        if (paymentId) {
            setPayments([{
                id: paymentId,
                ...payment
            }].concat(payments));
            return true;
        } else {
            return false;
        }
    }, [payments]);

    const updatePayment = useCallback(async (paymentId, paymentData) => {
        const success = await updatePaymentRequest(paymentId, paymentData);
        if (success) {
            setPayments(payments.map(payment => payment.id === paymentId ? paymentData : payment));
        }
        return success;
    }, [payments]);

    const deletePayment = useCallback(async paymentId => {
        const success = await deletePaymentRequest(paymentId);
        if (success) {
            setPayments(payments.filter(payment => payment.id !== paymentId));
        }
        return success;
    }, [payments]);

    // Update invitations data
    const addInvitation = useCallback(async invitationData => {
        const invitationId = await addInvitationRequest(invitationData);
        if (invitationId) {
            setInvitations([{
                id: invitationId,
                ...invitationData
            }].concat(invitations));
            return true;
        } else {
            return false;
        }
    }, [invitations]); 

    const updateInvitation = useCallback(async (invitationId, invitationData) => {
        const success = await updateInvitationRequest(invitationId, invitationData);
        if (success) {
            setInvitations(invitations.map(invitation => invitation.id === invitationId ? invitationData : invitation));
        }
        return success;
    }, [invitations]);

    const deleteInvitation = useCallback(async invitationId => {
        const success = await deleteInvitationRequest(invitationId);
        if (success) {
            setPayments(invitations.filter(invitation => invitation.id !== invitationId));
        }
        return success;
    }, [invitations]);

    // Update plans data
    const addPlan = useCallback(async plan => {
        // let vAndProposalLink = '';
        // if (plan.proposal) {
        //     const proposalDriveLink =
        //         await uploadProposalToDrive(plan.proposal, plan.district, plan.city, plan.institution);
        //     if (proposalDriveLink) {
        //         vAndProposalLink = `V#${proposalDriveLink}#`;
        //     } else {
        //         console.error('Could not upload proposal');
        //     }
        // }

        const planId = await addPlanRequest({ ...plan /*,proposal: vAndProposalLink*/ });
        if (planId) {
            setPlans([{
                ...plan,
                id: planId
            }].concat(plans));
            return true;
        } else {
            return false;
        }
    }, [plans]);

    const updatePlan = useCallback(async (planId, planData) => {
        const success = await updatePlanRequest(planId, planData);
		
        if (success) {
            setPlans(plans.map(plan => plan.id === planId ? planData : plan));
        }

        return success;
    }, [plans]);
    
    const deletePlan = useCallback(async planId => {
        const success = await deletePlanRequest(planId);
        if (success) {
            setPlans(plans.filter(plan => plan.id !== planId));
        }
        return success;
    }, [plans]);

    // Updating general settings in backend
    const updateSettings = useCallback(async settingsData => {
        const success = await updateSettingsRequest(settingsData);
        if (success) {
            setSettings(settingsData);
        }
        return success;
    }, []);

    const methods = {
        addMessagePattern: addMessagePattern,
        deleteMessagePattern: deleteMessagePattern,

        addInstructorPlacement: addInstructorPlacement,
        deleteInstructorPlacement: deleteInstructorPlacement,

        addInstructorPlanColor: addInstructorPlanColor,
        deleteInstructorPlanColor: deleteInstructorPlanColor,
        updateInstructorPlanColor: updateInstructorPlanColor,

        updateColorOfColoredStatus: updateColorOfColoredStatus,
        updateDescOfColoredStatus: updateDescOfColoredStatus,

        updatePlanMessage: updatePlanMessage,

        addPlanButtons: addPlanButtons,
        deletePlanButtons: deletePlanButtons,

        placeCandidates: placeCandidates,
        cancelCandidatePlacement: cancelCandidatePlacement,

        updateInstructorNotes: updateInstructorNotes,

        addInstructor: addInstructor,
        deleteInstructor: deleteInstructor,
        updateInstructor: updateInstructor,

        updateSchool: updateSchool,
        addSchool: addSchool,
        deleteSchool: deleteSchool,

        updateContact: updateContact,
        addContact: addContact,
        deleteContact: deleteContact,

        addPayment: addPayment,
        updatePayment: updatePayment,
        deletePayment: deletePayment,

        addInvitation: addInvitation,
        updateInvitation: updateInvitation,
        deleteInvitation: deleteInvitation,

        addPlan: addPlan,
        updatePlan: updatePlan,
        deletePlan: deletePlan,

        updateSettings: updateSettings
    };

    const value = {
        data: data,
        lookupData: lookupData,
        methods: methods
    };



    useEffect(() => {
        getDataRequest(responseData => {
            setSchools(responseData.schools);
            setLevels(responseData.levels);
            setSectors(responseData.sectors);
            setSchoolTypes(responseData.schoolTypes);
            setCities(responseData.cities);
            setSchoolStatuses(responseData.schoolStatuses);
            setContactStatuses(responseData.contactStatuses);
            setContacts(responseData.contacts);
            setRoles(responseData.roles);
            setMessages(responseData.messages);
            setPlans(responseData.plans);
            setInstructors(responseData.instructors);
            setInstructorPlacements(responseData.instructorPlacements);
            setColors(responseData.colors);
            setInstructorPlanColors(responseData.instructorPlanColors);
            setPlanButtons(responseData.planButtons);
            setPlanYears(responseData.planYears);
            setPlanStatuses(responseData.planStatuses);
            setPlanInvitations(responseData.planInvitations);
            setPlanDistricts(responseData.planDistricts);
            setPlanPlans(responseData.planPlans);
            setPayments(responseData.payments);
            setInvitations(responseData.invitations);
            setSettings(responseData.settings);

            setSchoolsLU(new Map(responseData.schools.map(school => [school.id, school])));
        });
    }, []);



    return (
        <SchoolsContext.Provider value={value}>
            {children}
        </SchoolsContext.Provider>
    );
}

export { SchoolsContext };
export default SchoolsContextProvider;