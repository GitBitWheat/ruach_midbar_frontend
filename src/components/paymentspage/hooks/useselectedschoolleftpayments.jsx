import { useState, useEffect } from "react";
import { sum } from '../../../utils/arrayUtils';

const useSelectedSchoolLeftPayments = (plansDS, paymentsDS) => {
    const [left, setLeft] = useState(0);

    useEffect(() => {
        const planOverallSum = sum(plansDS.map(plan => Math.trunc(plan.overall)));
        const paymentsPayedSum = sum(paymentsDS.map(payment => Math.trunc(payment.payed)));
        setLeft(planOverallSum - paymentsPayedSum);
    }, [plansDS, paymentsDS]);

    return left;
};

export default useSelectedSchoolLeftPayments;