import { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";

const useInvitationsDS = selectedSchool => {
    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;

    // DataSource of the invitations DataGrid - filtered by selected school
    const [invitationsDS, setInvitationsDS] = useState([]);
    useEffect(() => {
        setInvitationsDS(
            selectedSchool ?
            storeData.invitations.filter(invitation => invitation.sym === selectedSchool.sym) : []
        );
    }, [storeData.invitations, selectedSchool]);

    return invitationsDS;
};

export default useInvitationsDS;