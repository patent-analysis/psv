import { Form, Button, AutoComplete } from 'antd';
import StringManager from '../../utils/StringManager';
import './Search.css';
import { useHistory } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { getProteinList } from '../../utils/patentDataUtils';
import { useState, useEffect } from 'react';

const Search = () => {
    let history = useHistory();
    const [inputOptions, setInputOptions] = useState([]);
    const onFinish = (values) => {
        history.push({
            pathname : '/results/',
            search: `?proteinName=${values.protein}`,
            state: { proteinName: values.protein }
        });
        console.log('Searching for patent details for:', values);
    };

    useEffect(() => {
        getProteinList().then((data) => {
            const optionList = data.map((protein) => ({ value: protein.proteinId }));
            setInputOptions(optionList);
        }).catch((error) => console.debug(error));
    }, []);

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
                    options={inputOptions}
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