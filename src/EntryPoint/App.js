import './App.css';
import 'antd/dist/antd.css';
import PageRouter from '../components/PageRouter/PageRouter';
import HeaderMenu from '../components/HeaderMenu/HeaderMenu';
import { Layout } from 'antd';
import StringManager from '../utils/StringManager';
import { withAuthenticator } from '@aws-amplify/ui-react';
const { Content, Footer } = Layout;

function App() {
    return (
        <Layout className="layout" style={{ height: '100%' }}>
            <HeaderMenu />
            <Content style={{ padding: '0 50px' }}>
                <PageRouter />
            </Content>
            <Footer style={{ textAlign: 'center' }}>{StringManager.get('appOwnershipFooter')}</Footer>
        </Layout>
    );
}

export default withAuthenticator(App, { 
    // Render a sign out button once logged in
    includeGreetings: true
});
