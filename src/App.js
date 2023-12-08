import 'devextreme/dist/css/dx.light.css';
import './App.css';
import StoreContextProvider from './store/StoreContextProvider';
import { SettingsContextProvider } from './components/settingscontext/settingscontext';
import settingsConstants from './utils/settingsconstants.json';
import dxDataGrid from 'devextreme/ui/data_grid';
import dxButton from 'devextreme/ui/button';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PagesNavbar from './components/pagesnavbar/pagesnavbar';
import SchoolsPage from './components/schoolspage/schoolspage';
import MessagesForm from './components/messagesform/messagesform';
import PlansPage from './components/planspage/planspage';
import PlacementsPage from './components/placementspage/placementspage';
import InstructorsPage from './components/instructorspage/instructorspage';
import PaymentsPage from './components/paymentspage/paymentspage';
import ContactsPage from './components/contactspage/contactspage';
import StatusTablesPage from './components/statustablespage/statustablespage';
import SettingsPage from './components/settingspage/settingspage';

dxDataGrid.defaultOptions({ options: settingsConstants.dataGridDefaultProps });
dxButton.defaultOptions({ options: settingsConstants.buttonDefaultProps });

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <StoreContextProvider>
                <SettingsContextProvider>
                    <PagesNavbar/>
                    <Routes>
                        <Route path='/schools' element={<SchoolsPage/>} index/>
                        <Route path='/messages' element={<MessagesForm/>}/>
                        <Route path='/plans' element={<PlansPage/>}/>
                        <Route path='/placements' element={<PlacementsPage/>}/>
                        <Route path='/instructors' element={<InstructorsPage/>}/>
                        <Route path='/payments' element={<PaymentsPage/>}/>
                        <Route path='/contacts' element={<ContactsPage/>}/>
                        <Route path='/status' element={<StatusTablesPage/>}/>
                        <Route path='/settings' element={<SettingsPage/>}/>
                    </Routes>
                </SettingsContextProvider>
                </StoreContextProvider>
            </div>
        </BrowserRouter>
    );
}

export default App;
