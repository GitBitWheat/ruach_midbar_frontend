class Payment {
    constructor({ id, issuer, sym, plan, payed, schoolName, city }) {
        this.id = id || null;
        this.issuer = issuer || '';
        this.sym = sym || -1;
        this.plan = plan || '';
        this.payed = payed || '0';
        this.schoolName = schoolName || '';
        this.city = city || '';
    }
}

export default Payment;