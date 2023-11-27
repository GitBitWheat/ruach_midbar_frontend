import { useState, useCallback, useRef } from "react";
import { TextBox } from "devextreme-react";
import useTab from "./usetab";
import pageText from './linkcelltext.json';
import './linkcell.css';

/**
 * Lookup based custom edit cell
 * @param {Object} props Component props
 * @param {import("devextreme/ui/data_grid").ColumnEditCellTemplateData} props.data Data prop
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

    const textRef = useRef(null);
    const linkRef = useRef(null);
    const [onTextTabKey, onLinkTabKey] = useTab(textRef, linkRef);

    return (
        <div className="linkEditCellRow">
            <TextBox
                ref={textRef}
                defaultValue={text}
                placeholder={pageText.name}
                onValueChanged={onTextChanged}
                rtlEnabled={true}
                onKeyDown={onTextTabKey}
            />
            <TextBox
                ref={linkRef}
                defaultValue={url}
                placeholder={pageText.link}
                onValueChanged={onUrlChanged}
                rtlEnabled={false}
                onKeyDown={onLinkTabKey}
            />
        </div>
    );
};

export default LinkEditCell;