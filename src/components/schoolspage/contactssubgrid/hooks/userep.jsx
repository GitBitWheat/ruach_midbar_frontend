import { useContext } from 'react';
import { StoreContext } from '../../../../store/StoreContextProvider';
import { Button } from 'devextreme-react';
import pageText from '../../schoolspagetext.json';

const useRep = school => {
    const storeCtx = useContext(StoreContext);
    const storeMethods = storeCtx.methods;

    const contactToRep = (firstName, role, phone) => {
        if (!school) {
            console.error('Cannot find the school of this contact');
            return;
        }
        storeMethods.updateSchool(school.id, {
            ...school,
            representative:
                `${firstName}${role ? ' ' + role : ''}` +
                `#whatsapp://send/?phone=${(phone.startsWith('972') ? '': '972') + phone}#`
        });
    };

    const turnRepCellRender = ({ value }) => {
        return (
            <Button
                text={pageText.turnRep}
                onClick={_event => {contactToRep(value.firstName, value.role, value.phone);}}
                className={'noPaddingButton' + (value.isRep ? ' repBtn' : '')}
                disabled={value.isRep}
            />
        );
    };

    // Calculation of the cell value for the turn rep column
    const turnRepCalculateCellValue = data => ({
        firstName: data.firstName,
        role: data.role,
        phone: data.phone,
        isRep: school.representative &&
            (data.role ?
                (new RegExp(`^${data.firstName}\\s+${data.role}(.*)`)).test(school.representative) :
                data.firstName === school.representative.split('#')[0])
    });

    return [turnRepCellRender, turnRepCalculateCellValue];
};

export default useRep;