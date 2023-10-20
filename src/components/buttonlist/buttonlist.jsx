import { useState, useEffect } from "react";

import { Button } from "react-bootstrap";

import './buttonlist.css';
import pageText from './buttonlist-text.json';



// A list of buttons. By default all are grey. The one clicked turns green.
const ButtonList = ({buttonDescs, checkAll=null, uncheckAll=null, checkedByDefault=null}) => {
    const [selectedButtons, setSelectedButtons] = useState(checkedByDefault !== null ?
        Object.fromEntries(buttonDescs.map(buttonDesc => [buttonDesc.value, checkedByDefault[buttonDesc.value]])) :
        Object.fromEntries(buttonDescs.map(buttonDesc => [buttonDesc.value, false])));
    
    useEffect(() => {
        setSelectedButtons(checkedByDefault !== null ?
        Object.fromEntries(buttonDescs.map(buttonDesc => [buttonDesc.value, checkedByDefault[buttonDesc.value]])) :
        Object.fromEntries(buttonDescs.map(buttonDesc => [buttonDesc.value, false])));
    }, [checkedByDefault, buttonDescs]);

    return(
        <div className="buttonListContainer">
            {checkAll !== null ? (
                <Button
                    variant="primary"
                    onClick={() => {
                        setSelectedButtons(Object.fromEntries(Object.entries(selectedButtons).map(([buttonValue, _]) => [buttonValue, true])));
                        checkAll();
                    }}
                >
                    {pageText.checkAll}
                </Button>
            ) : null}

            {uncheckAll !== null ? (
                <Button
                    variant="primary"
                    onClick={() => {
                        setSelectedButtons(Object.fromEntries(Object.entries(selectedButtons).map(([buttonValue, _]) => [buttonValue, false])));
                        uncheckAll();
                    }}
                >
                    {pageText.uncheckAll}
                </Button>
            ) : null}

            {buttonDescs.map(buttonDesc => (
                <Button
                    key={buttonDesc.value}
                    variant={selectedButtons[buttonDesc.value] ? 'success' : 'secondary'}
                    onClick={() => {
                        setSelectedButtons({...selectedButtons, [buttonDesc.value]: !selectedButtons[buttonDesc.value]});
                        buttonDesc.onclick();
                    }}
                >
                    {buttonDesc.display}
                </Button>
            ))}
        </div>
    )
};

export default ButtonList;