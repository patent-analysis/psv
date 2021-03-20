import { Layout, Menu, Checkbox } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import StringManager from '../../utils/StringManager';
const { SubMenu } = Menu;
const { Sider } = Layout;

const renderCheckboxList = (filterObject, onChange) => {
    return Object.keys(filterObject).map((key, index) => {
        return (
            <Menu.Item key={index}>
                <Checkbox onChange={(e) => onChange(e, key)} checked={filterObject[key]}>{key}</Checkbox>
            </Menu.Item>
        )
    });
}

const PatentVisualizerSidebar = (props) => {
    return (
        <Sider width={'15%'} className="site-layout-background">
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                style={{ height: '100%', borderRight: 0 }}
            >
                <SubMenu key="sub1" icon={<UserOutlined />} title={StringManager.get('filterByAssignee')}>
                    {renderCheckboxList(props.assignees, props.onAssigneeFilterChange)}
                </SubMenu>
            </Menu>
        </Sider>
    );
}

export default PatentVisualizerSidebar;