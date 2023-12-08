import { useState, useCallback, useRef } from "react";
import { TextBox } from "devextreme-react";
import useTab from "./usetab";
import pageText from './linkcelltext.json';
import './linkcell.css';

const focusOnContentReady = event => {event.component.focus();};

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

    const linkRef = useRef(null);
    const onTextTabKey = useTab(linkRef);

    return (
        <div className="linkEditCellRow">
            <TextBox
                defaultValue={text}
                placeholder={pageText.name}
                onValueChanged={onTextChanged}
                rtlEnabled={true}
                onKeyDown={onTextTabKey}
                onContentReady={focusOnContentReady}
            />
            <TextBox
                ref={linkRef}
                defaultValue={url}
                placeholder={pageText.link}
                onValueChanged={onUrlChanged}
                rtlEnabled={false}
            />
        </div>
    );
};

export default LinkEditCell;