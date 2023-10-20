import { Container, Row, Col } from "react-bootstrap";
import { ListGroup } from "react-bootstrap";

import { Pages } from "../basepage/basepage";
import pageText from './homepage-text.json'
import './homepage.css'

const HomePage = ({setPage}) => {
    return (
        <Container fluid className="homepageContainer">
            <Row className="mb-3">
                <Col>
                    <h4>
                        {pageText.marketing}
                    </h4>
                    <ListGroup>
                      <ListGroup.Item onClick={() => {setPage(Pages.MESSAGES_FORM)}}>{pageText.sendingMessages}</ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <h4>
                        {pageText.plans}
                    </h4>
                    <ListGroup>
                      <ListGroup.Item>{pageText.process}</ListGroup.Item>
                      <ListGroup.Item>{pageText.gefen}</ListGroup.Item>
                      <ListGroup.Item>{pageText.excel}</ListGroup.Item>
                      <ListGroup.Item>{pageText.appoint}</ListGroup.Item>
                      <ListGroup.Item>{pageText.preferred}</ListGroup.Item>
                      <ListGroup.Item>{pageText.begin}</ListGroup.Item>
                      <ListGroup.Item>{pageText.allPlans}</ListGroup.Item>
                      <ListGroup.Item>{pageText.finished}</ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <h4>
                        {pageText.guide}
                    </h4>
                    <ListGroup>
                      <ListGroup.Item>{pageText.facebookMarketing}</ListGroup.Item>
                      <ListGroup.Item>{pageText.addGuide}</ListGroup.Item>
                      <ListGroup.Item>{pageText.guideMap}</ListGroup.Item>
                      <ListGroup.Item>{pageText.guideQueries}</ListGroup.Item>
                      <ListGroup.Item>{pageText.guideAppointing}</ListGroup.Item>
                      <ListGroup.Item>{pageText.guideList}</ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <h4>
                        {pageText.schools}
                    </h4>
                    <ListGroup>
                      <ListGroup.Item>{pageText.locatingSchools}</ListGroup.Item>
                      <ListGroup.Item>{pageText.schools}</ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    );
}

export default HomePage;