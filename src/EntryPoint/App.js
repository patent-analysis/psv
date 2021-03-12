import './App.css';
import 'antd/dist/antd.css';
import Router from '../components/Router/Router';
import HeaderMenu from '../components/HeaderMenu/HeaderMenu';
import { Layout } from 'antd';
const { Content, Footer } = Layout;

function App() {
  return (
    <Layout className="layout">
    <HeaderMenu />
    <Content style={{ padding: '0 50px' }}>
      <Router />
    </Content>
    <Footer style={{ textAlign: 'center' }}>Patent Visualization App - Created by The Avengers</Footer>
  </Layout>
  );
}

export default App;
