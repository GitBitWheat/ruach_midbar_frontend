import { useState, useEffect, useContext } from "react";
import { SchoolsContext } from "../../../store/SchoolsContextProvider";

const useInvitationsDS = selectedSchool => {
    const storeCtx = useContext(SchoolsContext);
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