class Contact {
    constructor({ id, schoolId, schoolName, firstName, lastName, phone, role, status,
        googleContactsResourceName }) {
        this.id = id ? id : null;
        this.schoolId = schoolId ? schoolId : null;
        this.schoolName = schoolName ? schoolName : null;
        this.firstName = firstName ? firstName : null;
        this.lastName = lastName ? lastName : null;
        this.phone = phone ? phone : null;
        this.role = role ? role : null;
        this.status = status ? status : null;
        this.googleContactsResourceName = googleContactsResourceName || null;
    }
}



export default Contact;