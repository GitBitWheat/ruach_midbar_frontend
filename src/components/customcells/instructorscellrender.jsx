import { Fragment } from 'react';

/** Instructors column cell render */
const InstructorsCellRender = ({ data }) => {
    const instructors = [data.instructor1, data.instructor2, data.instructor3, data.instructor4]
        .filter(inst => inst)
        .map(inst => inst.split('#'))
        .map(instSplt => [instSplt, instSplt.length >= 2 ? { href: instSplt[1] } : { 'aria-disabled': true }]);

    return (
        <span>
            {instructors.map(([instSplit, aProps], idx) => (
                <Fragment key={idx}>
                    <a {...aProps}>{instSplit[0]}</a>
                    { idx < instructors.length - 1 && ', '}
                </Fragment>
            ))}
        </span>
    );
};

export default InstructorsCellRender;