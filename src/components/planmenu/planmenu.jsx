import { useState, useContext } from "react";
import SearchBar from "../searchbar/SearchBar";
import pageText from './planmenu-text.json'
import { StoreContext } from '../../store/StoreContextProvider'
import { SettingsContext } from "../settingscontext/settingscontext";



const PlanMenu = ({ selectedPlanId, selectedPlanYear, selectedPlanStatus, setNewPlan }) => {

    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    const settings = useContext(SettingsContext);

    // TO DO: Take default year from database
    const [year, setYear] = useState(selectedPlanId ? storeData.planYears.find(py => py.desc === selectedPlanYear) : {desc: settings.defaultYear || ''});

    const [status, setStatus] = useState(selectedPlanId ? storeData.planStatuses.find(ps => ps.desc === selectedPlanStatus) : {desc: 'לשבץ'});

    return (
        <>
            <SearchBar
                barName="planYears"
                placeholder={pageText.year}
                options={storeData.planYears}
                labelKey={py => py.desc !== null ? py.desc : pageText.empty}
                setter={setYear}
                defaultSelected={year}
                noneSelectedValue={null}
                width={'8.75vw'}
            />
            <SearchBar
                barName="planStatuses"
                placeholder={pageText.status}
                options={storeData.planStatuses.filter(status => storeData.plans.filter(plan => year === null || plan.year === year.desc).some(plan => plan.status === status.desc))}
                labelKey={ps => ps.desc !== null ? ps.desc : pageText.empty}
                setter={setStatus}
                defaultSelected={status}
                noneSelectedValue={null}
                width={'8.75vw'}
            />
            <SearchBar
                barName="sameYearStatusInstitutePlans"
                placeholder={pageText.plan}
                options={storeData.plans.filter(plan => (year === null || plan.year === year.desc) && (status === null || plan.status === status.desc))}
                labelKey={plan => (plan.institution !== null ? plan.institution : pageText.noInstitution) +
                    (plan.city !== null ? ' ' + plan.city : ` ${pageText.noCity}`) +
                    (plan.plan !== null ? ' ' + plan.plan.split('#')[0] : ` ${pageText.noPlan}`)}
                setter={setNewPlan}
                noChangeWhenNoneSelected
                width={'20vw'}
            />
        </>
    );
};

export default PlanMenu;