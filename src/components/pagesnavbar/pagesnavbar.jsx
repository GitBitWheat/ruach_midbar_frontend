import { useState, useEffect } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import pageText from './pagesnavbartext.json';
import './pagesnavbar.css';

const PagesNavbar = () => {

    const [page, setPage] = useState(null);

    const nav = useNavigate();
    useEffect(() => {
        const last_page = localStorage.getItem('last_page') || '/schools';
        setPage(last_page);
        nav(last_page);
    }, [nav]);

    const handlePageChange = newPage => () => {
        try {
            localStorage.setItem('last_page', newPage);
        } catch(err) {
            console.error('Cannot save the last page you opened\n', err);
        }
        setPage(newPage);
    };

    const navLink = (route, text) => (
        <Link
            to={route}
            onClick={handlePageChange(route)}
            className={'nav-link' + (page === route ? ' navbarSelectedOption' : '')}
        >
            {text}
        </Link>
    );

    return <>
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand>{pageText.interface}</Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {navLink('/schools', pageText.schoolsPage)}
                        {navLink('/messages', pageText.messagesForm)}
                        {navLink('/plans', pageText.plansPage)}
                        {navLink('/placements', pageText.placementsPage)}
                        {navLink('/instructors', pageText.instructorsPage)}
                        {navLink('/payments', pageText.paymentsPage)}
                        {navLink('/contacts', pageText.contactsPage)}
                        {navLink('/status', pageText.statusTables)}
                        {navLink('/settings', pageText.settingsPage)}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>;
};

export default PagesNavbar;