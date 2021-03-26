import React, { useState, useEffect } from 'react';
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
                <Checkbox onChange={(e) => onChange(e, key)} checked={filterObject[key]}>
                    {key} {colorKeys[key] && <ColorSquare color={colorKeys[key]} />}
                </Checkbox>
            </Menu.Item>
        )
    });
}

const PatentVisualizerSidebar = (props) => {
    const { sequenceLength } = props;
    const [ minValue, setMinValue ] = useState(1);
    const [ maxValue, setMaxValue ] = useState(sequenceLength);
    useEffect(() => {
        // If maxValue is not defined or 0 we want to make sure the full range is selected
        // This happens on first render when component have not sent the data to props.sequenceLength
        if(!maxValue) {
            setMaxValue(sequenceLength);
        }
    }, [sequenceLength, maxValue]);

    // Notify parent component that the sequence range has changed
    // useEffect(() => {
    //     onSequenceRangeFilterChange({ min: minValue, max: maxValue });
    // }, [minValue, maxValue, onSequenceRangeFilterChange]);

    return (
        <Sider width={'15%'} className="site-layout-background">
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1', 'sub2']}
                style={{ height: '100%', borderRight: 0 }}
            >
                <SubMenu key="sub1" icon={<UserOutlined />} title={StringManager.get('filterByAssignee')}>
                    {renderCheckboxList(props.assignees, props.onAssigneeFilterChange, props.colorKeys)}
                </SubMenu>
                <SubMenu key="sub2" icon={<UserOutlined />} title="Filter By Sequence Position">
                    <Slider style={{ width: '80%', margin: 'auto', padding: '25px 0px' }} range value={[ minValue, maxValue ]} max={props.sequenceLength} onChange={(data) => {
                        setMinValue(data[0]);
                        setMaxValue(data[1]);
                    }} />
                    <div style={{ 
                        display: 'flex',
                        margin: 'auto',
                        justifyContent: 'center',
                        alignItems: 'baseline'
                    }}>
                        <span>Min:</span>
                        <InputNumber
                            min={1}
                            max={maxValue}
                            style={{ margin: '0 16px', width: '40%' }}
                            value={minValue}
                            onChange={(min) => {
                                setMinValue(min);
                                console.log('min', min);
                            }}
                        />
                    </div>
                    <div style={{ 
                        display: 'flex',
                        margin: 'auto',
                        justifyContent: 'center',
                        alignItems: 'baseline'
                    }}>
                        <span>Max:</span>
                        <InputNumber
                            min={minValue}
                            max={props.sequenceLength}
                            style={{ margin: '0 16px', width: '40%' }}
                            value={maxValue}
                            onChange={(max) => setMaxValue(max)}
                        />
                    </div>
                </SubMenu>
            </Menu>
        </Sider>
    );
}

export default PatentVisualizerSidebar;