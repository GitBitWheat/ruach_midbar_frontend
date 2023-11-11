export const plansInstsCalculateDisplayValue = data =>
    [data.instructor1, data.instructor2, data.instructor3, data.instructor4]
    .filter(inst => inst).map(inst => inst.split('#')[0]).join(', ');