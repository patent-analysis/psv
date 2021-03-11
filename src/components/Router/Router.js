import Search from '../Search/Search';
import PatentUpload from '../PatentUpload/PatentUpload';
import { Switch, Route } from "react-router-dom";
const Router = () => (
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
  </Switch>
);
export default Router; 