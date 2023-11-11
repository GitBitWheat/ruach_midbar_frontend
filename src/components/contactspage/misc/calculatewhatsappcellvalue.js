// The whatsapp column doesn't come from the data source itself, but rather needs to be computed
export const calculateWhatsappCellValue = data => {
    if (data.firstName && data.phone) {
        let text = data.firstName;
        if (data.role) {
            text += ` ${data.role}`;
        }
        return `${text}#whatsapp://send/?phone=${data.phone}#`;
    } else {
        return null;
    }
};