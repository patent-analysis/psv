import Search from '../Search/Search';
import PatentUpload from '../PatentUpload/PatentUpload';
import PatentVisualizer from '../PatentVisualizer/PatentVisualizer';
import { Switch, Route } from 'react-router-dom';
const PageRouter = () => (
    <Switch>
        <Route exact path="/">
            <Search />
        </Route>
        <Route path="/upload">
            <PatentUpload />
        </Route>
        <Route path="/search">
            <Search />
        </Route>
        <Route path="/results">
            <PatentVisualizer />
        </Route>
    </Switch>
);
export default PageRouter; 