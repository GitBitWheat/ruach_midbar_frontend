import { Fragment } from "react";
import { useState, useEffect, useContext } from "react";
import { StoreContext } from "../../../store/StoreContextProvider";
import { Container, Row, Col } from "react-bootstrap";
import pageText from './plancard-text.json'
import { linkToA } from '../../../utils/displayutils';

const PlanCard = ({ planId }) => {
    
    const storeCtx = useContext(StoreContext);
    const storeData = storeCtx.data;
    const [plan, setPlan] = useState({});
    useEffect(() => {
        if (planId) {
            const p = storeData.plans.find(p => p.id === planId);
            setPlan(p ? ({
                ...p,
                instructors: [p.instructor1, p.instructor2, p.instructor3, p.instructor4]
                            .filter(inst => inst)
            } || {}) : {});
        } else {
            setPlan(null);
        }
    }, [storeData.plans, planId]);

    return (
        <Container>
            <Row>
                <Col>
                    <h4>{pageText.planCard}</h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <b>{pageText.institution}</b>
                </Col>
                <Col>
                    <b>{pageText.city}</b>
                </Col>
                <Col>
                    <b>{pageText.plan}</b>
                </Col>
            </Row>
            <Row>
                <Col>
                    {plan?.institution || <>&nbsp;</>}
                </Col>
                <Col>
                    {plan?.city || <>&nbsp;</>}
                </Col>
                <Col>
                    {plan?.plan ? linkToA(plan.plan) : <>&nbsp;</>}
                </Col>
            </Row>

            <Row>
                <Col xs={4}>
                    <b>{pageText.grade}</b>
                </Col>
                <Col xs={4}>
                    <b>{pageText.contact}</b>
                </Col>
                <Col xs={2}>
                    <b>{pageText.weeks}</b>
                </Col>
                <Col xs={2}>
                    <b>{pageText.days}</b>
                </Col>
            </Row>
            <Row>
                <Col xs={4}>
                    {plan?.grade || <>&nbsp;</>}
                </Col>
                <Col xs={4}>
                    {plan?.contact ? linkToA(plan.contact, false) : <>&nbsp;</>}
                </Col>
                <Col xs={2}>
                    {plan?.weeks || <>&nbsp;</>}
                </Col>
                <Col xs={2}>
                    {plan?.days || <>&nbsp;</>}
                </Col>
            </Row>

            <Row>
                <Col>
                    <b>{`${pageText.instructors}: `}</b>
                    {((plan?.instructors || []).map((instructor, idx) => (
                            <Fragment key={idx}>
                                {linkToA(instructor, false)}
                                {idx < (plan?.instructors.length || 0) - 1 ? ', ' : null}
                            </Fragment>
                        ))) || null}
                </Col>
            </Row>
            <Row>
                <Col>
                    <b>{`${pageText.details}: `}</b>{plan?.details || null}
                </Col>
            </Row>
        </Container>
    );
};



export default PlanCard;