import { useState, useCallback } from 'react';

import { Navbar, Container, Nav } from 'react-bootstrap';

import HomePage from '../homepage/homepage';
import MessagesForm from '../messagesform/messagesform';
import StatusTablesPage from '../statustablespage/statustablespage';
import SchoolsPage from '../schoolspage/schoolspage';
import ContactsPage from '../contactspage/contactspage';
import PlansPage from '../planspage/planspage'
import PlacementsPageOld from '../placementspageold/placementspage';
import PlacementsPage from '../placementspage/placementspage';
import InstructorsPage from '../instructorspage/instructorspage';
import PaymentsPage from '../paymentspage/paymentspage';
import SettingsPage from '../settingspage/settingspage';

import pageText from './basepage-text.json';
import './basepage.css';

const Pages = Object.freeze({
    HOME_PAGE: 'HomePage',
    MESSAGES_FORM: 'MessagesForm',
    STATUS_TABLES: 'StatusTables',
    SCHOOLS_PAGE: 'SchoolsPage',
    CONTACTS_PAGE: 'ContactsPage',
    PLACEMENTS_PAGE_OLD: 'PlacementsPageOld',
    PLACEMENTS_PAGE: 'PlacementsPage',
    PLANS_PAGE: 'PlansPage',
    INSTRUCTORS_PAGE: 'InstructorsPage',
    PAYMENTS_PAGE: 'PaymentsPage',
    SETTINGS_PAGE: 'SettingsPage',
});

const renderPage = (page, setPage) => {
    if (page === Pages.HOME_PAGE) {
        return (<HomePage setPage={setPage}/>);
    } else if (page === Pages.MESSAGES_FORM) {
        return (<MessagesForm />);
    } else if (page === Pages.STATUS_TABLES) {
        return (<StatusTablesPage />);
    } else if (page === Pages.SCHOOLS_PAGE) {
        return (<SchoolsPage />);
    } else if (page === Pages.CONTACTS_PAGE) {
        return (<ContactsPage />);
    } else if (page === Pages.PLANS_PAGE) {
        return (<PlansPage />);
    } else if (page === Pages.PLACEMENTS_PAGE_OLD) {
        return (<PlacementsPageOld />);
    } else if (page === Pages.PLACEMENTS_PAGE) {
        return (<PlacementsPage />);
    } else if (page === Pages.INSTRUCTORS_PAGE) {
        return (<InstructorsPage />);
    } else if (page === Pages.PAYMENTS_PAGE) {
        return (<PaymentsPage />);
    }else if (page === Pages.SETTINGS_PAGE) {
        return (<SettingsPage />);
    } else {
        return (<></>);
    }
};

const BasePage = () => {

    const [page, setPage] = useState(localStorage.getItem('last_page') || null);

    const handlePageChange = useCallback(newPage => {
        try {
            localStorage.setItem('last_page', newPage);
        } catch(err) {
            console.error('Cannot save the last page you opened\n', err);
        }
        setPage(newPage);
    }, []);

    return <>
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand>{pageText.interface}</Navbar.Brand>
            </Container>
            <Navbar.Collapse style={{width: '-moz-available'}}>
              <Nav className="me-auto">
                <Nav.Link onClick={() => {handlePageChange(Pages.SCHOOLS_PAGE)}}>
                    <span className={page === Pages.SCHOOLS_PAGE ? 'navbarSelectedOption' : ''}>
                        {pageText.schoolsPage}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.MESSAGES_FORM)}}>
                    <span className={page === Pages.MESSAGES_FORM ? 'navbarSelectedOption' : ''}>
                        {pageText.messagesForm}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.PLANS_PAGE)}}>
                    <span className={page === Pages.PLANS_PAGE ? 'navbarSelectedOption' : ''}>
                        {pageText.plansPage}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.PLACEMENTS_PAGE_OLD)}}>
                    <span className={page === Pages.PLACEMENTS_PAGE_OLD ? 'navbarSelectedOption' : ''}>
                        {pageText.placementsPage} - ישן
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.PLACEMENTS_PAGE)}}>
                    <span className={page === Pages.PLACEMENTS_PAGE ? 'navbarSelectedOption' : ''}>
                        {pageText.placementsPage}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.INSTRUCTORS_PAGE)}}>
                    <span className={page === Pages.INSTRUCTORS_PAGE ? 'navbarSelectedOption' : ''}>
                        {pageText.instructorUploadsPage}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.PAYMENTS_PAGE)}}>
                    <span className={page === Pages.PAYMENTS_PAGE ? 'navbarSelectedOption' : ''}>
                        {pageText.paymentsPage}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.CONTACTS_PAGE)}}>
                    <span className={page === Pages.CONTACTS_PAGE ? 'navbarSelectedOption' : ''}>
                        {pageText.contactsPage}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.STATUS_TABLES)}}>
                    <span className={page === Pages.STATUS_TABLES ? 'navbarSelectedOption' : ''}>
                        {pageText.statusTables}
                    </span>
                </Nav.Link>
                <Nav.Link onClick={() => {handlePageChange(Pages.SETTINGS_PAGE)}}>
                    <span className={page === Pages.SETTINGS_PAGE ? 'navbarSelectedOption' : ''}>
                        {pageText.settingsPage}
                    </span>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
        </Navbar>
        <div id='basepage'>
            {renderPage(page, setPage)}
        </div>
    </>;
};

export { Pages };
export default BasePage;