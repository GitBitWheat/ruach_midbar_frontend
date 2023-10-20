import { useState, useCallback } from "react";
import { TextBox } from "devextreme-react";
import pageText from './whatsappcelltext.json';
import './whatsappcell.css';



const whatsappLink = 'whatsapp://send/?phone=';

/**
 * Lookup based custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnCellTemplateData} props.data Data prop
 */
const WhatsappEditCell = ({ data }) => {

    const [name, setName] = useState(data.value ? data.value.split('#')[0] : '');
    const [phone, setPhone] = useState(data.value ? data.value.split('#')[1].replace(whatsappLink, '') : '');

    const onNameChanged = useCallback(event => {
        setName(event.value);
        data.setValue(`${event.value}#${whatsappLink}${phone}#`);
    }, [data, phone]);

    const onPhoneChanged = useCallback(event => {
        setPhone(event.value);
        data.setValue(`${name}#${whatsappLink}${event.value}#`);
    }, [data, name]);



    return (
        <div className="whatsappEditCellRow">
            <TextBox
                defaultValue={name}
                placeholder={pageText.name}
                onValueChanged={onNameChanged}
                rtlEnabled={true}
            />
            <TextBox
                defaultValue={phone}
                placeholder={pageText.phone}
                onValueChanged={onPhoneChanged}
                rtlEnabled={false}
            />
        </div>
    );
};



export default WhatsappEditCell;