import { Form, Input, Button, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import StringManager from '../../utils/StringManager';
import './Search.css';

function handleMenuClick(e) {
    console.log('click', e);
}

const menu = (
    <Menu onClick={handleMenuClick}>
        <Menu.Item key="1">
        PCSK9
        </Menu.Item>
        <Menu.Item key="2">
        COVID-19
        </Menu.Item>
        <Menu.Item key="3">
        WHEY
        </Menu.Item>
    </Menu>
);

const Search = () => {
    const onFinish = (values) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
            name="basic"
            className="search-container"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
        >
            <Form.Item
                label={StringManager.get('selectEpitope')}
                name="sequence"
                className="search-container__input"
                rules={[{ required: false }]}
            >
                <Input />
            </Form.Item>

            <Dropdown overlay={menu}>
                <Button className="search-container__dropdown">
                    {StringManager.get('selectProtein')} <DownOutlined />
                </Button>
            </Dropdown>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {StringManager.get('submit')}
                </Button>
            </Form.Item>
        </Form>
    );
};
export default Search;