import { useState } from 'react';
import { Layout, Menu, Checkbox, Slider, InputNumber } from 'antd';
import 'antd/dist/antd.css';
import { UserOutlined } from '@ant-design/icons';
import StringManager from '../../utils/StringManager';
import ColorSquare from './ColorSquare';
const { SubMenu } = Menu;
const { Sider } = Layout;

const renderCheckboxList = (filterObject, onChange, colorKeys) => {
    return Object.keys(filterObject).map((key, index) => {
        return (
            <Menu.Item key={index}>
                {colorKeys[key] && <ColorSquare color={colorKeys[key]} />}
                <Checkbox onChange={(e) => onChange(e, key)} checked={filterObject[key]}>
                    {key}
                </Checkbox>
            </Menu.Item>
        );
    });
}

const renderInputNumber = (value, label, onChange) => {
    return (
        <div key={'inputNumber' + label} style={{ 
            display: 'flex',
            margin: 'auto',
            justifyContent: 'center',
            alignItems: 'baseline'
        }}>
            <span>{label}</span>
            <InputNumber
                style={{ margin: '0 16px', width: '40%' }}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
const renderSequenceFilter = (min, max, length, onSequenceRangeFilterChange) => {
    return (
        [
            <Slider key={'slider1'} style={{ width: '80%', margin: 'auto', padding: '25px 0px' }} range value={[ min, max ]} max={length}
                onChange={([ minSlider, maxSlider ]) => onSequenceRangeFilterChange({ min: minSlider, max: maxSlider })} 
            />,
            renderInputNumber(min, StringManager.get('minLabel'), (min) => onSequenceRangeFilterChange({ min, max })),
            renderInputNumber(max, StringManager.get('maxLabel'), (max) => onSequenceRangeFilterChange({ min, max }))
        ]
    );
}

const PatentVisualizerSidebar = (props) => {
    const { onSequenceRangeFilterChange, sequenceRange } = props;
    const { min, max, length } = sequenceRange;
    const [siderWidth, setSiderWidth] = useState(300);
    let isDragging = false;

    const MIN_SIDER_WIDTH = 100;
    return (
        <Sider width={siderWidth} className="site-layout-background">
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                width: 20,
                cursor: 'ew-resize'
            }}
            onMouseDown={() => {
                isDragging = true;
                document.onmousemove = (e) => {
                    if(isDragging) {
                        // pageX is returning a higher number than the edge of our sider so we offset by
                        // an arbitrary 30px to make it smoother
                        setSiderWidth(e.pageX > MIN_SIDER_WIDTH ? e.pageX - 30: MIN_SIDER_WIDTH);
                    }
                    return false;
                }
                document.onmouseup = () => {
                    isDragging = false;
                    document.onmousemove = undefined;
                }
            }}
            />
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1', 'sub2']}
                style={{ height: '100%', borderRight: 0 }}
            >
                <SubMenu key="sub1" icon={<UserOutlined />} title={StringManager.get('filterByAssignee')}>
                    {renderCheckboxList(props.assignees, props.onAssigneeFilterChange, props.colorKeys)}
                </SubMenu>
                <SubMenu key="sub2" icon={<UserOutlined />} title={StringManager.get('filterBySequencePosition')}>
                    {renderSequenceFilter(min, max, length, onSequenceRangeFilterChange)}
                </SubMenu>
                <Menu.Item>
                    <Checkbox onChange={props.toggleBaseline} checked={props.showBaseline}>
                        {StringManager.get('showAminoSequence')}
                    </Checkbox>
                </Menu.Item>
            </Menu>
        </Sider>
    );
}

export default PatentVisualizerSidebar;