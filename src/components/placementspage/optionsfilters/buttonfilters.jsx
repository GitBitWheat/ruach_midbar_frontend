import { Button } from "react-bootstrap";
import pageText from './buttonfilterstext.json';
import './buttonfilters.css';

export class ButtonFiltersControls {
    constructor({ options, fltrs, boolSwitch, enableAll, disableAll }) {
        this.options = options;
        this.fltrs = fltrs;
        this.boolSwitch = boolSwitch;
        this.enableAll = enableAll;
        this.disableAll = disableAll;
    }
};

/**
 * @param {object} params
 * @param {ButtonFiltersControls} params.controls
 */
const ButtonFilters = ({ controls }) => {
    return (
        <div className="buttonsContainer">
            <Button
                variant='primary'
                onClick={() => {controls.enableAll();}}
            >
                {pageText.enableAll}
            </Button>
            <Button
                variant='primary'
                onClick={() => {controls.disableAll();}}
            >
                {pageText.disableAll}
            </Button>
            {controls.options.map(({ value, text }) => (
                <Button
                    key={value}
                    variant={controls.fltrs[value] ? 'success' : 'secondary'}
                    onClick={() => {controls.boolSwitch(value);}}
                >
                    {text}
                </Button>
            ))}
        </div>
    )
};

export default ButtonFilters;