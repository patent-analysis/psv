import { useState } from 'react';
import { Layout, Menu, Checkbox, Slider, InputNumber, Input, Tooltip, Button } from 'antd';
import 'antd/dist/antd.css';
import './PatentVisualizer.css';
import { UserOutlined } from '@ant-design/icons';
import StringManager from '../../utils/StringManager';
import ColorSquare from './ColorSquare';
import { DownloadOutlined } from '@ant-design/icons';
const { SubMenu } = Menu;
const { Sider } = Layout;
const { Search } = Input;

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
            margin: '25px auto',
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
    const marks = {
        0: '0',
        [length]: length,
    };
    return (
        [
            <Slider marks={marks} key={'slider1'} style={{ width: '80%', margin: '25px auto' }} range={{ draggableTrack: true, step: 10 }} step={10} value={[ min, max ]} max={length}
                onChange={([ minSlider, maxSlider ]) => onSequenceRangeFilterChange({ min: minSlider, max: maxSlider })} 
            />,
            renderInputNumber(min, StringManager.get('minLabel'), (min) => onSequenceRangeFilterChange({ min, max })),
            renderInputNumber(max, StringManager.get('maxLabel'), (max) => onSequenceRangeFilterChange({ min, max }))
        ]
    );
}

const renderAddSequence = (addManualSequence, manualSeq, setManualSeq, manualSequenceList, toggleManualSeq) => {
    const checkboxes = manualSequenceList.map((seq, index) => {
        return (
            <Menu.Item
                style={{ display: 'flex', margin: 'auto' }}
                key={`addSeq_checkbox_${index}`}
            >
                <Checkbox onChange={(e) => toggleManualSeq(seq.name, e.target.checked)} checked={seq.show}>
                    {seq.name}
                </Checkbox>
            </Menu.Item>
        );
    });

    return (
        [
            <Menu.Item
                style={{ display: 'flex', margin: 'auto' }}
                key={'addSeq_1'}
            >
                <Tooltip
                    trigger={['focus']}
                    title={StringManager.get('tooltipSeqName')}
                    placement="topLeft"
                    overlayClassName="numeric-input"
                >
                    <Input size="small" placeholder={StringManager.get('seqName')} style={{ margin: 'auto' }} 
                        onChange={(e) => setManualSeq({ seqName: e.target.value, seqString: manualSeq.seqString })}
                    />
                </Tooltip>
            </Menu.Item>,
            <Menu.Item
                style={{ display: 'flex', margin: 'auto' }}
                key={'addSeq_2'}
            >
                <Tooltip
                    trigger={['focus']}
                    title={StringManager.get('tooltipSeqExample')}
                    placement="topLeft"
                    overlayClassName="numeric-input"
                >
                    <Search
                        placeholder={StringManager.get('addSeq')}
                        allowClear
                        enterButton={StringManager.get('add')}
                        size="small"
                        style={{ margin: 'auto' }}
                        disabled={manualSeq.seqName ? false : true}
                        onChange={(e) => setManualSeq({ seqName: manualSeq.seqName, seqString: e.target.value })}
                        onSearch={() => addManualSequence(manualSeq.seqString, manualSeq.seqName) }
                    />
                </Tooltip>
            </Menu.Item>,
            ...checkboxes
        ]
    );
}

const PatentVisualizerSidebar = (props) => {
    const { onSequenceRangeFilterChange, sequenceRange } = props;
    const { min, max, length } = sequenceRange;
    const [siderWidth, setSiderWidth] = useState(300);
    const [manualSeq, setManualSeq] = useState({ seqName: '', seqString: '' });
    let isDragging = false;

    const MIN_SIDER_WIDTH = 100;
    return (
        <Sider width={siderWidth} className="site-layout-background">
            <div className="visualizer__sidebar__expander"
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
                <SubMenu key="sub3" icon={<UserOutlined />} title={'Add Sequence'}>
                    {renderAddSequence(props.addManualSequence, manualSeq, setManualSeq, props.manualSequenceList, props.toggleManualSeq)}
                </SubMenu>
                <Menu.Item>
                    <Checkbox onChange={props.toggleBaseline} checked={props.showBaseline}>
                        {StringManager.get('showAminoSequence')}
                    </Checkbox>
                </Menu.Item>
                <Menu.Item style={{ display: 'flex' }}>
                    <Tooltip
                        trigger={['hover']}
                        title={StringManager.get('saveChartTooltip')}
                        placement="topLeft"
                    >
                        <Button style={{ margin: 'auto' }} onClick={props.downloadChart} type="primary" icon={<DownloadOutlined />} size={'small'}>
                            {StringManager.get('downloadChart')}
                        </Button>
                    </Tooltip>
                </Menu.Item>
                <Menu.Item style={{ display: 'flex' }}>
                    <Tooltip
                        trigger={['hover']}
                        title={props.shouldExpand ? StringManager.get('renderFullChartTooltip') : StringManager.get('renderScrollableChartTooltip')}
                        placement="topLeft"
                    >
                        <Button style={{ margin: 'auto' }} onClick={props.onRenderFullChart}>
                            {props.shouldExpand ? StringManager.get('renderFullChart'): StringManager.get('renderScrollableChart')}
                        </Button>
                    </Tooltip>
                </Menu.Item>
            </Menu>
        </Sider>
    );
}

export default PatentVisualizerSidebar;