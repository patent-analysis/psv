import './App.css';
import 'antd/dist/antd.css';
import { BrowserRouter as Router } from "react-router-dom";
import PageRouter from '../components/PageRouter/PageRouter';
import HeaderMenu from '../components/HeaderMenu/HeaderMenu';
import { Layout } from 'antd';
import StringManager from '../utils/StringManager';
const { Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <HeaderMenu />
        <Content style={{ padding: '0 50px' }}>
          <PageRouter />
        </Content>
        <Footer style={{ textAlign: 'center' }}>{StringManager.get('appOwnershipFooter')}</Footer>
      </Layout>
    </Router>
  );
}

export default App;
