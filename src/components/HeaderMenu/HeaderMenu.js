import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import StringManager from '../../utils/StringManager';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import logo from '../../assets/logo.png';
const { Header } = Layout;

const HeaderMenu = () => (
    <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} style={{ display: 'flex' }}>
            <Link to="/">
                <img src={logo} alt="Logo" style={{ width: '100px' }} />
            </Link>
            <Menu.Item key="1">
                <Link to="/upload">{StringManager.get('uploadPatents')}</Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Link to="/search">{StringManager.get('search')}</Link>
            </Menu.Item>
            <Menu.Item key="3" style={{ marginLeft: 'auto' }}>
                <AmplifySignOut />
            </Menu.Item>
        </Menu>
    </Header>
);
export default HeaderMenu;
