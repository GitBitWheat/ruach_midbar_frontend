import { useState, useEffect, useContext } from 'react';

import { StoreContext } from '../../store/StoreContextProvider'

import uuid from 'react-uuid';

import pageText from './messagesform-text.json'

import { Container } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/esm/Button";
import { InputGroup } from 'react-bootstrap';

import MultiSelectSearchBar from '../multiselectsearchbar/MultiSelectSearchBar';
import MessageStatusesTable from '../messagestatusestable/messagestatusestable';
import SearchBar from '../searchbar/SearchBar';

import './messagesform.css'

import { selectSchools, selectContacts } from './selectors';
import { messagesRequest } from '../../utils/localServerRequests';
import SchoolsContactsTable from './schoolscontactstable';
import ContactPrioritiesGrid from './contactprioritiesgrid';
import useContactPriorities from './usecontactpriorities';

const searchBarLabelKey = option => option.desc !== null ? `${option.desc}` : pageText.emptyFilter;

const MessagesForm = () => {
    const schoolsCtx = useContext(StoreContext);
    const ctxData = schoolsCtx.data;
    const ctxMethods = schoolsCtx.methods;

    const [pattern, setPattern] = useState({msg1: '', msg2: '', msg3: ''});
    const [patternTitle, setPatternTitle] = useState('');

    const [msg1, setMsg1] = useState('');
    const [msg2, setMsg2] = useState('');
    const [msg3, setMsg3] = useState('');

    const [selectedSchools, setSelectedSchools] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);

    const [schoolAmount, setSchoolAmount] = useState(0);
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [selectedSchoolStatuses, setSelectedSchoolStatuses] = useState([]);

    const [isRep, setIsRep] = useState('yes');
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedContactStatuses, setSelectedContactStatuses] = useState([]);

    const [contactPriorities, pushPriority, onPrioritiesReorder, onPrioritiesRowRemoving] = useContactPriorities();

    const [newStatus, setNewStatus] = useState('');
    const [msgStatuses, setMsgStatuses] = useState([]);

    const [schoolAmountError, setSchoolAmountError] = useState(false);
    const [newStatusError, setNewStatusError] = useState(false);

    useEffect(() => {
        setMsg1(pattern.msg1);
        setMsg2(pattern.msg2);
        setMsg3(pattern.msg3);
    }, [pattern]);

    return (
        <>
            <Container fluid className="formGrid">
            <Row className="borderedColumns">
            <Col className="square border border-dark">
                <Row className="mb-3">
                    <Col>
                        <h4>{pageText.messageContent}</h4>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (patternTitle !== '') {
                                    ctxMethods.addMessagePattern(msg1, msg2, msg3, patternTitle);
                                    setPatternTitle('');
                                }
                                else {
                                    alert('יש להזין כותרת לתבנית');
                                }
                            }}
                        >
                            {pageText.addMessagePattern}
                        </Button>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <InputGroup className="mb-3">
                          <Form.Control
                            value={patternTitle}
                            onChange={e => { setPatternTitle(e.target.value) }}
                            placeholder={'הזינו כותרת התבנית'}
                          />
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <SearchBar
                            barName="addMessagePattern"
                            placeholder={'תבניות'}
                            options={ctxData.messages}
                            labelKey={messagePattern => messagePattern.title}
                            setter={setPattern}
                            className="addMessagePatternSearchBar"
                            menuItemAddition={option => (
                                <>
                                    <i
                                        className="bi bi-x-lg"
                                        onClick={() => {
                                            ctxMethods.deleteMessagePattern(option.id);
                                        }}
                                        style={{marginLeft: '0.3vw'}}
                                    />
                                    <i className="bi bi-star" />
                                </>
                            )}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formMsgText1">
                        <Form.Label>{pageText.msgTextLabel}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={msg1}
                            onChange={e => { setMsg1(e.target.value) }}
                        />
                    </Form.Group>
                <Row className="mb-3">
                </Row>
                    <Form.Group as={Col} controlId="formMsgText2">
                        <Form.Label>{pageText.msgFileLabel}</Form.Label>
                        <Form.Control
                            value={msg2}
                            style={{textAlign: 'left'}}
                            onChange={e => { setMsg2(e.target.value) }}
                        />
                    </Form.Group>
                <Row className="mb-3">
                </Row>
                    <Form.Group as={Col} controlId="formMsgText3">
                        <Form.Label>{pageText.msgTextLabel}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={msg3}
                            onChange={e => { setMsg3(e.target.value) }}
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Col>
                        <Button variant="danger" onClick={() => {
                            messagesRequest(msg1, msg2, msg3, ['526554868'], ['omri'], '', null, null, null, () => {});
                        }}>
                            {pageText.testButton}
                        </Button>
                    </Col>
                </Row>
            </Col>

            <Col className="square border border-dark">
                <Form>
                <Row className="mb-3">
                    <Col>
                        <h4>{pageText.chooseSchools}</h4>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formSchoolAmount">
                        <Form.Label>{pageText.schoolAmountLabel}</Form.Label>
                        <Form.Control
                            type="number"
                            value={schoolAmount}
                            onChange={e => {if (e.target.value >= 0) {setSchoolAmount(e.target.value)} }}
                            step={10}
                        />
                        {schoolAmountError ?
                        <p className="errorMessage">{pageText.schoolAmountError}</p> : null}
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formSchoolStatuses">
                        <Form.Label>{pageText.schoolStatusesLabel}</Form.Label>
                        <MultiSelectSearchBar
                            selected = {selectedSchoolStatuses}
                            setSelected = {setSelectedSchoolStatuses}
                            options = {ctxData.schoolStatuses}
                            placeholder = ""
                            labelKey={searchBarLabelKey}
                        />
                        <Form.Text className="text-muted">{pageText.noneChosenNote}</Form.Text>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formSchoolLevels">
                        <Form.Label>{pageText.schoolLevelsLabel}</Form.Label>
                        <MultiSelectSearchBar
                            selected = {selectedLevels}
                            setSelected = {setSelectedLevels}
                            options = {ctxData.levels}
                            placeholder = ""
                            labelKey={searchBarLabelKey}
                        />
                        <Form.Text className="text-muted">{pageText.noneChosenNote}</Form.Text>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formSchoolSectors">
                        <Form.Label>{pageText.schoolSectorsLabel}</Form.Label>
                        <MultiSelectSearchBar
                            selected = {selectedSectors}
                            setSelected = {setSelectedSectors}
                            options = {ctxData.sectors}
                            placeholder = ""
                            labelKey={searchBarLabelKey}
                        />
                        <Form.Text className="text-muted">{pageText.noneChosenNote}</Form.Text>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formSchoolTypes">
                        <Form.Label>{pageText.schoolTypesLabel}</Form.Label>
                        <MultiSelectSearchBar
                            selected = {selectedTypes}
                            setSelected = {setSelectedTypes}
                            options = {ctxData.schoolTypes}
                            placeholder = ""
                            labelKey={searchBarLabelKey}
                        />
                        <Form.Text className="text-muted">{pageText.noneChosenNote}</Form.Text>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formSchoolCities">
                        <Form.Label>{pageText.schoolCitiesLabel}</Form.Label>
                        <MultiSelectSearchBar
                            selected = {selectedCities}
                            setSelected = {setSelectedCities}
                            options = {ctxData.cities}
                            placeholder = ""
                            labelKey={searchBarLabelKey}
                        />
                        <Form.Text className="text-muted">{pageText.noneChosenNote}</Form.Text>
                    </Form.Group>
                </Row>
            </Form>
            </Col>

            <Col className="square border border-dark">
                <Form>
                    <Row className="mb-3">
                        <Col>
                            <h4>{pageText.chooseContacts}</h4>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <b>{pageText.setPriority}</b>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} controlId="formContactIsRep">
                            <Form.Label>{pageText.contactIsRepLabel}</Form.Label>
                            <Form.Check
                                inline
                                type="radio"
                                label={pageText.yes}
                                name="isRepRadios"
                                id="isRepRadios1"
                                onClick={() => {setIsRep('yes')}}
                                defaultChecked
                            />
                            <Form.Check
                                inline
                                type="radio"
                                label={pageText.no}
                                name="isRepRadios"
                                id="isRepRadios2"
                                onClick={() => {setIsRep('no')}}
                            />
                            <Form.Check
                                inline
                                type="radio"
                                label={pageText.both}
                                name="isRepRadios"
                                id="isRepRadios3"
                                onClick={() => {setIsRep('both')}}
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} controlId="formContactRoles">
                            <Form.Label>{pageText.contactRolesLabel}</Form.Label>
                            <MultiSelectSearchBar
                                selected = {selectedRoles}
                                setSelected = {setSelectedRoles}
                                options = {ctxData.roles}
                                placeholder = ""
                                labelKey={searchBarLabelKey}
                            />
                            <Form.Text className="text-muted">{pageText.noneChosenNote}</Form.Text>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} controlId="formContactStatus">
                            <Form.Label>{pageText.contactStatusesLabel}</Form.Label>
                            <MultiSelectSearchBar
                                selected = {selectedContactStatuses}
                                setSelected = {setSelectedContactStatuses}
                                options = {ctxData.contactStatuses}
                                placeholder = ""
                                labelKey={searchBarLabelKey}
                            />
                            <Form.Text className="text-muted">{pageText.noneChosenNote}</Form.Text>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Button variant="primary" onClick={() => {
                                    pushPriority({
                                        id: uuid(),
                                        isRep: isRep,
                                        contactStatuses: selectedContactStatuses,
                                        roles: selectedRoles
                                    });
                                }}>
                                {pageText.addPriority}
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <Row className="mb-3">
                    <Col>
                        <ContactPrioritiesGrid
                            contactPriorities={contactPriorities}
                            onReorder={onPrioritiesReorder}
                            onRowRemoving={onPrioritiesRowRemoving}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Button variant="primary" onClick={() => {
                                if (schoolAmount > 0) {
                                    setSchoolAmountError(false);
                                    const schoolSelection = selectSchools(
                                        ctxData.schools,
                                        selectedLevels,
                                        selectedSectors,
                                        selectedTypes,
                                        selectedCities,
                                        selectedSchoolStatuses,
                                        schoolAmount
                                    );
                                    setSelectedSchools(schoolSelection);
                                    console.log(schoolSelection);

                                    const contactSelection = selectContacts(
                                        ctxData.contacts,
                                        schoolSelection,
                                        contactPriorities
                                    );
                                    setSelectedContacts(contactSelection);
                                    console.log(contactSelection);
                                    setMsgStatuses([]);
                                    }
                                else {
                                    setSchoolAmountError(true);
                                    alert(pageText.schoolAmountError);
                                }
                            }}>
                            {pageText.chooseContacts}
                        </Button>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formNewStatus">
                        <Form.Label>{pageText.setStatus}</Form.Label>
                        <Form.Control
                            value={newStatus}
                            onChange={e => { setNewStatus(e.target.value) }}
                        />
                        {newStatusError ?
                        <p className="errorMessage">{pageText.newStatusError}</p> : null}
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <Button variant="primary" onClick={() => {
                            if (newStatus !== '') {
                                setNewStatusError(false);
                                messagesRequest(msg1, msg2, msg3, selectedContacts.map(contact => contact.phone),
                                selectedContacts.map(contact => contact.firstName), newStatus,
                                selectedContacts.map(contact => contact.schoolId), selectedContacts.map(contact => contact.id),
                                selectedContacts.map(contact => contact.isRep), setMsgStatuses);
                            }
                            else {
                                setNewStatusError(true);
                                alert(pageText.newStatusError);
                            }
                        }}>
                            {pageText.sendMessages}
                        </Button>
                    </Col>
                </Row>
            </Col>
            </Row>
                <Row>
                    <Col>
                        <p>
                            {`${pageText.amountSelectedSchools} `}<b>{selectedSchools.length}</b>{`, ${pageText.amountSelectedContacts} `}<b>{selectedContacts.length}</b>
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <SchoolsContactsTable
                            selectedSchools={selectedSchools}
                            selectedContacts={selectedContacts}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <MessageStatusesTable
                            msgStatuses={msgStatuses}
                            selectedContacts={selectedContacts}
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default MessagesForm;