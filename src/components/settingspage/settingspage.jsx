import { useState, useCallback, useContext } from "react";
import { TextBox, Lookup, Button } from "devextreme-react";
import { SettingsContext } from "../settingscontext/settingscontext";

import pageText from './settingspagetext.json';
import './settingspage.css';
import { updateInstructorsCreds, updatePeopleCreds, updateProposalCreds } from "../../utils/localServerRequests";

const editModeDS = [
    { value: 'cell', text: pageText.cell },
    { value: 'form', text: pageText.form },
];

const SettingsPage = () => {

    const settings = useContext(SettingsContext);

    const [yearText, setYearText] = useState(settings.defaultYear || '');
    const [editMode, setEditMode] = useState(settings.editMode || 'cell');

    const handleYearChange = useCallback(event => {
        const newYear = event.event.target.value;
        //setYearText(newYear);
        settings.setDefaultYear(newYear);
        event.element.style.backgroundColor = 'lightGrey';
        setTimeout(() => {
            event.element.style.backgroundColor = 'white';
        }, 150);
    }, [settings]);

    const handleEditModeChange = useCallback(event => {
        settings.setEditMode(event.value);
    }, [settings]);

    const reset = useCallback(() => {
        settings.reset();
        setYearText('');
        setEditMode('cell');
    }, [settings]);

    return (
        <div>
            <table>
            <tbody>
                <tr>
                    <td colSpan={2}>
                        <Button
                            text={pageText.reset}
                            onClick={reset}
                        />
                        <span className='note'>
                            {pageText.resetNote}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>{pageText.yearLabel}</span>
                    </td>
                    <td>
                        <TextBox
                            value={yearText}
                            onValueChange={value => {
                                setYearText(value);
                            }}
                            onEnterKey={handleYearChange}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>{pageText.editModeLabel}</span>
                    </td>
                    <td>
                        <Lookup
                            dataSource={editModeDS}
                            valueExpr='value'
                            displayExpr='text'
                            value={editMode}
                            searchEnabled={false}
                            onValueChanged={handleEditModeChange}
                            rtlEnabled={true}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>{pageText.updateGoogleAccount}</span>
                    </td>
                    <td>
                        <Button
                            text={pageText.contacts}
                            onClick={updatePeopleCreds}
                        />
                        <Button
                            text={pageText.instructors}
                            onClick={updateInstructorsCreds}
                        />
                        <Button
                            text={pageText.proposal}
                            onClick={updateProposalCreds}
                        />
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
    );
};



export default SettingsPage;