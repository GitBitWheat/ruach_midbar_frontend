import { useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";
import { dataGridRowLongClick } from "../../../utils/datagridrowlongclick";

/**
 * Returns RowPrepared event handlers which will add a "long click event handler" for each row in the
 * options and candidates datagrid. Long click on a row will make it switch tables, with the corresponding
 * adjustments to their color and the grids state.
 */
const useInstToOptionOrCandidate = (selectedPlan, optionSwitchColorToDefault, deleteColor, resortGrids) => {
    const storeCtx = useContext(StoreContext);
    const storeMethods = storeCtx.methods;

    const turnToCandidate = data => {
        storeMethods.addInstructorPlacement(data.id, selectedPlan && selectedPlan.id);

        // After turning an instructor to a candidate, delete their color
        deleteColor(data.id);
    };

    const optionsRowPreparedHandler = dataGridRowLongClick(
        event => {
            turnToCandidate(event.data);

            // After updating the options/candidates data, resort the grids by dists
            // Only works with a timeout for some reason
            setTimeout(resortGrids, 1000);
        }
    );

    const turnToOptional = data => {
        storeMethods.deleteInstructorPlacement(data.id, selectedPlan && selectedPlan.id);

        // After turning an instructor to optional, give them the default option color
        optionSwitchColorToDefault(data.id);
    };

    const candidatesRowPreparedHandler = dataGridRowLongClick(
        event => {
            turnToOptional(event.data);

            // After updating the options/candidates data, resort the grids by dists
            // Only works with a timeout for some reason
            setTimeout(resortGrids, 1000);
        }
    );

    return [optionsRowPreparedHandler, candidatesRowPreparedHandler];
};

export default useInstToOptionOrCandidate;