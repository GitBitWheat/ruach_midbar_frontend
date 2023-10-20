import 'devextreme/dist/css/dx.light.css';
import './App.css';
import SchoolsContextProvider from './store/SchoolsContextProvider';
import { SettingsContextProvider } from './components/settingscontext/settingscontext';
import settingsConstants from './utils/settingsconstants.json';
import dxDataGrid from 'devextreme/ui/data_grid';
import BasePage from './components/basepage/basepage';

dxDataGrid.defaultOptions({ options: settingsConstants.dataGridDefaultProps });

function App() {
    return (
        <div className="App">
            <SchoolsContextProvider>
            <SettingsContextProvider>
                <BasePage />
            </SettingsContextProvider>
            </SchoolsContextProvider>
        </div>
    );
}

export default App;
