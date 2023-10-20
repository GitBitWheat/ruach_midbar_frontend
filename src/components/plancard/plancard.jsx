import { Fragment } from "react";

import { Container, Row, Col } from "react-bootstrap";

import pageText from './plancard-text.json'

import { linkToA } from '../../utils/displayutils';



const emptyStrIfNull = val => val !== null ? val : '';



const PlanCard = ({ institution, city, plan, days, instructors, contact, details, grade, weeks }) => {
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
                    {emptyStrIfNull(institution)}
                </Col>
                <Col>
                    {emptyStrIfNull(city)}
                </Col>
                <Col>
                    {plan !== null && plan !== '' ? linkToA(plan) : ''}
                </Col>
            </Row>

            <Row>
                <Col>
                    <b>{pageText.grade}</b>
                </Col>
                <Col>
                    <b>{pageText.weeks}</b>
                </Col>
                <Col>
                    <b>{pageText.days}</b>
                </Col>
            </Row>
            <Row>
                <Col>
                    {emptyStrIfNull(grade)}
                </Col>
                <Col>
                    {emptyStrIfNull(weeks)}
                </Col>
                <Col>
                    {emptyStrIfNull(days)}
                </Col>
            </Row>

            <Row>
                <Col>
                    <b>{`${pageText.contact}: `}</b>{linkToA(contact, false)}
                </Col>
            </Row>
            <Row>
                <Col>
                    <b>{`${pageText.instructors}: `}</b>{emptyStrIfNull(instructors.map((instructor, idx) => (
                            <Fragment key={idx}>
                                {linkToA(instructor, false)}
                                {idx < instructors.length - 1 ? ', ' : null}
                            </Fragment>
                        )))}
                </Col>
            </Row>
            <Row>
                <Col>
                    <b>{`${pageText.details}: `}</b>{emptyStrIfNull(details)}
                </Col>
            </Row>
        </Container>
    );
};



export default PlanCard;