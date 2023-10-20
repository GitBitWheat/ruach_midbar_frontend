import { useCallback } from 'react';
import { useEffect, useState, createContext } from 'react';

const SettingsContext = createContext();

const handleChange = (setValue, key, msg) => val => {
    setValue(val);
    try {
        localStorage.setItem(key, val);
    } catch(err) {
        console.error(`${msg}\n`, err);
    }
};

const EDIT_MODE_KEY = 'edit_mode';
const DEFAULT_YEAR_KEY = 'default_year';



const SettingsContextProvider = ({ children }) => {

    const [editMode, setEditMode] = useState(localStorage.getItem(EDIT_MODE_KEY) || 'cell');
    const [defaultYear, setDefaultYear] = useState(localStorage.getItem(DEFAULT_YEAR_KEY) || null);

    const [handleEditModeChange, setHandleEditModeChange] = useState(() => _val => {});
    const [handleDefaultYearChange, setHandleDefaultYearChange] = useState(() => _val => {});
    useEffect(() => {
        setHandleEditModeChange(() =>
            handleChange(setEditMode, EDIT_MODE_KEY, 'Could not save edit mode')
        );
        setHandleDefaultYearChange(() =>
            handleChange(setDefaultYear, DEFAULT_YEAR_KEY, 'Could not save default year')
        );
    }, []);

    const reset = useCallback(() => {
        localStorage.clear();
        handleChange(setEditMode, EDIT_MODE_KEY, 'Could not save edit mode')('cell');
    }, [])

    const [value, setValue] = useState({
        editMode: editMode,
        setEditMode: handleEditModeChange,

        defaultYear: defaultYear,
        setDefaultYear: handleDefaultYearChange,

        reset: reset,
    });
    useEffect(() => {
        setValue({
            editMode: editMode,
            setEditMode: handleEditModeChange,

            defaultYear: defaultYear,
            setDefaultYear: handleDefaultYearChange,

            reset: reset,
        });
    }, [
        editMode, handleEditModeChange,
        defaultYear, handleDefaultYearChange,
        reset
    ]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export { SettingsContext, SettingsContextProvider };