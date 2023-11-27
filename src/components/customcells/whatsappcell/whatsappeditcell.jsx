import { useState, useCallback, useRef } from "react";
import { TextBox } from "devextreme-react";
import useTab from "../linkcell/usetab";
import pageText from './whatsappcelltext.json';
import './whatsappcell.css';

const whatsappLink = 'whatsapp://send/?phone=';

/**
 * Lookup based custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnEditCellTemplateData} props.data Data prop
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

    const textRef = useRef(null);
    const phoneRef = useRef(null);
    const [onTextTabKey, onPhoneTabKey] = useTab(textRef, phoneRef);

    return (
        <div className="whatsappEditCellRow">
            <TextBox
                ref={textRef}
                defaultValue={name}
                placeholder={pageText.name}
                onValueChanged={onNameChanged}
                rtlEnabled={true}
                onKeyDown={onTextTabKey}
            />
            <TextBox
                ref={phoneRef}
                defaultValue={phone}
                placeholder={pageText.phone}
                onValueChanged={onPhoneChanged}
                rtlEnabled={false}
                onKeyDown={onPhoneTabKey}
            />
        </div>
    );
};



export default WhatsappEditCell;