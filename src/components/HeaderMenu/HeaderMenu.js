import { Link } from "react-router-dom";
import { Layout, Menu } from 'antd';
const { Header } = Layout;

const HeaderMenu = () => (
    <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
            <Menu.Item key="1">
                <Link to="/upload">Upload Patents</Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Link to="/search">Search</Link>
            </Menu.Item>
        </Menu>
    </Header>
);
export default HeaderMenu;