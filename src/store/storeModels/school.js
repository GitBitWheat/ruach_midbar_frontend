class School {
    constructor({ id, sym, name, level, sector, schoolType, city, representative, schoolDate, status }) {
        this.id = id || null;
        this.sym = sym || 0;
        this.name = name || '';
        this.level = level || '';
        this.sector = sector || '';
        this.schoolType = schoolType || '';
        this.city = city || '';
        this.representative = representative || '';
        this.schoolDate = schoolDate || '';
        this.status = status || '';
    }
}



export default School;