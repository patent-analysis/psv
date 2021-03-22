import { Form, Input, Button, AutoComplete } from 'antd';
import StringManager from '../../utils/StringManager';
import './Search.css';
import { useHistory } from 'react-router-dom';

const options = [
    {
        value: 'PCSK9',
    },
    {
        value: 'COVID-19',
    },
    {
        value: 'WHEY',
    },
];

const Search = () => {
    let history = useHistory();
    const onFinish = (values) => {
        history.push('/results');
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
            <Form.Item
                className="search-container__searchbox"
                name="protein"
                label={StringManager.get('selectProtein')}
            >
                <AutoComplete
                    options={options}
                    placeholder={StringManager.get('selectProtein')}
                    filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {StringManager.get('submit')}
                </Button>
            </Form.Item>
        </Form>
    );
};
export default Search;