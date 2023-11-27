import { useState, useCallback } from "react";
import { TextBox } from "devextreme-react";
import pageText from './linkcelltext.json';
import './linkcell.css';

/**
 * Lookup based custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnCellTemplateData} props.data Data prop
 */
const LinkEditCell = ({ data }) => {

    const [text, setText] = useState(data.value ? data.value.split('#')[0] : '');
    const [url, setUrl] = useState(data.value ? data.value.split('#')[1] : '');

    const onTextChanged = useCallback(event => {
        setText(event.value);
        // Forget about text and url
        data.setValue(`${event.value}#${url}#`);
    }, [data, url]);

    const onUrlChanged = useCallback(event => {
        setUrl(event.value);
        // Forget about text and url
        data.setValue(`${text}#${event.value}#`);
    }, [data, text]);



    return (
        <div className="linkEditCellRow">
            <TextBox
                defaultValue={text}
                placeholder={pageText.name}
                onValueChanged={onTextChanged}
                rtlEnabled={true}
            />
            <TextBox
                defaultValue={url}
                placeholder={pageText.link}
                onValueChanged={onUrlChanged}
                rtlEnabled={false}
            />
        </div>
    );
};

export default LinkEditCell;