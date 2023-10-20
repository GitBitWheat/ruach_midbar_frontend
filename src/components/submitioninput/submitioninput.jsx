import { useState } from "react";

import { Form, InputGroup } from "react-bootstrap";

import './submitioninput.css'



const SubmitionInput = ({ defaultValue, submitionConfig }) => {

    let onSubmit, defaultDisplay;
    if (typeof submitionConfig === 'object' && submitionConfig !== null) {
        onSubmit = submitionConfig.onSubmit;
        defaultDisplay = submitionConfig.defaultDisplay;
    } else {
        onSubmit = submitionConfig;
        defaultDisplay = v => v;
    }

    const [value, setValue] = useState(defaultValue ? defaultDisplay(defaultValue) : '');
    const [backgroundColor, setBackgroundColor] = useState('white');



    return (
        <InputGroup>
            <Form.Control
                as="textarea"
                value={value}
                onChange={e => {setValue(e.target.value);}}
                style={{backgroundColor: backgroundColor}}
                className="submitioninput"
                onClick={e => {e.stopPropagation();}}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit(value);
                        setBackgroundColor('lightgrey');
                        setTimeout(() => {
                            setBackgroundColor('white');
                        }, 100);
                    }
                }}
            />
        </InputGroup>
    );
};



export default SubmitionInput;