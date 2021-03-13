import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import StringManager from '../../utils/StringManager';
const { Header } = Layout;

const HeaderMenu = () => (
    <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
            <Menu.Item key="1">
                <Link to="/upload">{StringManager.get('uploadPatents')}</Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Link to="/search">{StringManager.get('search')}</Link>
            </Menu.Item>
        </Menu>
    </Header>
);
export default HeaderMenu;