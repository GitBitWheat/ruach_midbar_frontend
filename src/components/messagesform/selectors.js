function selectSchools(schools, levels, sectors, schoolTypes, cities, schoolStatuses, schoolAmount) {
    return schools.filter(school =>
        (levels.length < 1 || levels.some(level => level.desc === school.level)) &&
        (sectors.length < 1 || sectors.some(sector => sector.desc === school.sector)) &&
        (schoolTypes.length < 1 || schoolTypes.some(schoolType => schoolType.desc === school.schoolType)) &&
        (cities.length < 1 || cities.some(city => city.desc === school.city)) &&
        (schoolStatuses.length < 1 || schoolStatuses.some(schoolStatus => schoolStatus.desc === school.status))
    ).slice(0, schoolAmount);
}



function selectContacts(contacts, schools, priorities) {
    const selectedContacts = [];

    const schooolsAndContacts = schools.map(school => [school, contacts.filter(contact => contact.schoolId === school.id)]);

    for (const [school, schoolContacts] of schooolsAndContacts) {
        let foundContact = false;

        for (const contact of schoolContacts) {
            const isRep = (new RegExp(`^${contact.firstName}\\s+${contact.role}(.*)`)).test(school.representative);

            for (const priority of priorities) {
                if (priority.isRep !== 'both' && ((priority.isRep === 'yes' && !isRep) || (priority.isRep === 'no' && isRep))) {
                    continue;
                }
                if ((priority.contactStatuses.length < 1 || priority.contactStatuses.some(contactStatus => contactStatus.desc === contact.status)) &&
                    (priority.roles.length < 1 || priority.roles.some(role => role.desc === contact.role))) {
                    selectedContacts.push({...contact, isRep: isRep});
                    foundContact = true;
                    break;
                }
            }

            if (foundContact) {
                break;
            }
        }
    }

    return selectedContacts;
}



export { selectSchools, selectContacts };