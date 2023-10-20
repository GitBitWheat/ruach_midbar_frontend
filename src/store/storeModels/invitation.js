class Invitation {
    constructor({ id, sym, schoolName, city, planName, contact, amount, lessonPrice,
        overallPricing, residue, notes, issueDate, issuer, issueSum, checkDate, payed,
        instructor, expectedExpenses, afterExpenses, }) {
        this.id = id || null;
        this.sym = sym || -1;
        this.schoolName = schoolName || '';
        this.city = city || '';
        this.planName = planName || '';
        this.contact = contact || '';
        this.amount = amount || 0;
        this.lessonPrice = lessonPrice || '0.0000';
        this.overallPricing = overallPricing || '0.0000';
        this.residue = residue || '0.0000';
        this.notes = notes || '';
        this.issueDate = issueDate || '';
        this.issuer = issuer || '';
        this.issueSum = issueSum || '0.0000';
        this.checkDate = checkDate || '';
        this.payed = payed || '0';
        this.instructor = instructor || '';
        this.expectedExpenses = expectedExpenses || '0.0000';
        this.afterExpenses = afterExpenses || '0.0000';
    }
}

export default Invitation;

/*

 */