import { Form, Button, AutoComplete } from 'antd';
import StringManager from '../../utils/StringManager';
import './Search.css';
import { useHistory } from 'react-router-dom';
import logo from '../../assets/logo.png';

//TODO: Replace this static list with a list of all protein Ids available in the database.
const options = [
    {
        value: 'PCSK9',
    }
];

const Search = () => {
    let history = useHistory();
    const onFinish = (values) => {
        history.push({
            pathname : '/results/',
            search: `?proteinName=${values.protein}`,
            state: { proteinName: values.protein }
        });
        console.log('Searching for patent details for:', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
            name="basic"
            className="search-container"
            initialValues={{ remember: true }}
            onFinish={(values) => onFinish(values)}
            onFinishFailed={onFinishFailed}
        >
            <img src={logo} alt="Logo" />
            <Form.Item
                className="search-container__searchbox"
                name="protein"
            >
                <AutoComplete
                    size="large"
                    options={options}
                    placeholder={StringManager.get('selectProtein')}
                    filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                />
            </Form.Item>
            <Form.Item>
                <Button size="large" type="primary" htmlType="submit">
                    {StringManager.get('submit')}
                </Button>
            </Form.Item>
        </Form>
    );
};
export default Search;