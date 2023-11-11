class Plan {
    constructor({ id, year, proposal, status, invitation, level, sym, schoolId, institution, contact, date, district, city, plan,
        days, day, weeks, grade, lessonsPerDay, lessons, pricePerHour, details, msg }) {
        this.id = id || null;
        this.year = year || null;
        this.proposal = proposal || null;
        this.status = status || null;
        this.invitation = invitation || null;
        this.level = level || null;
        this.schoolId = schoolId || -1;
        this.sym = sym ? sym : -1;
        this.institution = institution || null;
        this.contact = contact || null;
        this.date = date || null;
        this.district = district || null;
        this.city = city || null;
        this.plan = plan || null;
        this.days = days || null;
        this.day = day || null;
        this.weeks = weeks ? weeks : 0;
        this.grade = grade || null;
        this.lessonsPerDay = lessonsPerDay ? lessonsPerDay : 0;
        this.lessons = lessons ? lessons : 0;
        this.pricePerHour = pricePerHour ? pricePerHour : 0;
        this.details = details || null;
        this.msg = msg || null;

        this.overall = this.lessons && this.pricePerHour ? this.lessons * this.pricePerHour : 0;
    }
}



export default Plan;