import { Fragment } from "react";
import { Container, Row, Col } from "react-bootstrap";
import pageText from './plancard-text.json'
import { linkToA } from '../../../utils/displayutils';



const PlanCard = ({ plan }) => {
    return (
        <Container>
            <Row>
                <Col>
                    <h4>{pageText.planCard}</h4>
                </Col>
            </Row>

            {plan ? (<>
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
                    <Col>
                        <b>{pageText.grade}</b>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {plan.institution || ''}
                    </Col>
                    <Col>
                        {plan.city || ''}
                    </Col>
                    <Col>
                        {plan.plan ? linkToA(plan.plan) : ''}
                    </Col>
                    <Col>
                        {plan.grade || ''}
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <b>{pageText.weeks}</b>
                    </Col>
                    <Col>
                        <b>{pageText.days}</b>
                    </Col>
                    <Col>
                        <b>{pageText.contact}</b>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {plan.weeks || ''}
                    </Col>
                    <Col>
                        {plan.days || ''}
                    </Col>
                    <Col>
                        {plan.contact ? linkToA(plan.contact, false) : ''}
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <b>{`${pageText.instructors}: `}</b>
                        {(plan.instructors.map((instructor, idx) => (
                                <Fragment key={idx}>
                                    {linkToA(instructor, false)}
                                    {idx < plan.instructors.length - 1 ? ', ' : null}
                                </Fragment>
                            ))) || ''}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <b>{`${pageText.details}: `}</b>{plan.details || ''}
                    </Col>
                </Row>
            </>) : pageText.noPlanChosen}
        </Container>
    );
};



export default PlanCard;