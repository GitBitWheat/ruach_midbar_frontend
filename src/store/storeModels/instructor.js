import instructorTypeDescs from '../../static/instructor_type_buttons.json'



class Instructor {
    constructor({ id, firstName, lastName, area, cv, city, sector, notes, certificates, policeApproval,
        insurance, agreement, instructorTypes }) {
        this.id = id || null;
        this.firstName = firstName || '';
        this.lastName = lastName || '';
        this.cv = cv || '';
        this.city = city || '';
        this.area = area || '';
        this.sector = sector || '';
        this.notes = notes || '';
        this.certificates = certificates || '';
        this.policeApproval = policeApproval || '';
        this.insurance = insurance || '';
        this.agreement = agreement || '';

        this.instructorTypes =
            Object.fromEntries(
                instructorTypeDescs
                .map(type => [type.value, (instructorTypes || []).includes(type.value)])
            );
    }
}



export default Instructor;