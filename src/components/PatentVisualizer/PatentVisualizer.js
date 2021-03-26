import React, { useState, useEffect, useRef } from 'react';
import 'antd/dist/antd.css';
import './PatentVisualizer.css';
import { CloseOutlined } from '@ant-design/icons';
import { Heatmap } from '@ant-design/charts';
import { Layout, Button } from 'antd';
import PatentVisualizerSidebar from './PatentVisualizerSidebar';
import PatentTable from './PatentTable';
import { assignColors } from '../../utils/colors';
import { getUnique } from '../../utils/utils';
import mock from '../../utils/mockResults';
const { Sider } = Layout;

const KEYS = {
    assignee: 'Assignee',
    sequencePosition: 'Sequence Position',
    patentNumber: 'Patent Number'
}
Object.freeze(KEYS);

const PatentVisualizer = () => {
    const [data, setData] = useState([]);
    const [colorKeys, setColorKeys] = useState({});
    const [details, setDetails] = useState({ show: false, patentId: 0, seqPosition: 0 });
    const _dataRef = useRef([]);
    useEffect(() => {
        asyncFetch();
    }, []);

    // Assignees Effect
    const [assignees, setAssignees] = useState({});
    useEffect(() => {
        setData(_dataRef.current.filter(patentData => {
            return assignees[patentData[KEYS.assignee]]
        }))
    }, [assignees]);

    const asyncFetch = () => {
        Promise.resolve(mock)
            .then((response) => {
                setData(response);
                _dataRef.current = response;
                const uniqueAssignees = getUnique(response, KEYS.assignee);
                let assigneeFilters = {
                };
                uniqueAssignees.forEach((item) => {
                    assigneeFilters[item] = true;
                });
                setAssignees(assigneeFilters);
                setColorKeys(assignColors(uniqueAssignees));
            })
            .catch((error) => {
                console.log('fetch data failed', error);
            });
    };
    const gridStyles = { 
        grid: {
            line: {
                style: {
                    stroke: 'black',
                    lineWidth: 1,
                    strokeOpacity: 0.3,
                    cursor: 'pointer'
                }
            }
        }
    }

    const config = {
        width: 650,
        height: 500,
        autoFit: true,
        data: data,
        xField: KEYS.sequencePosition,
        xAxis: gridStyles,
        yAxis: gridStyles,
        yField: KEYS.patentNumber,
        colorField: KEYS.assignee,
        color: (assignee) => {
            return colorKeys[assignee];
        },
        showContent: true,
        meta: { [KEYS.sequencePosition] : { type: 'cat' } },
    };
    
    const onEvent = (chart, event) => {
        // If event.data is not available user clicked on empty tile of heatmap
        if(event.type === 'click' && event.data) {
            setDetails({
                show: true,
                patentId: event.data.data[KEYS.patentNumber],
                assignee: event.data.data[KEYS.assignee],
                seqPosition: event.data.data[KEYS.sequencePosition]
            });
        }
    }
    const onAssigneeFilterChange = (e, name) => {
        setAssignees({
            ...assignees,
            [name]: e.target.checked
        });
    }
    return (
        [
            <Layout>
                <PatentVisualizerSidebar assignees={assignees} colorKeys={colorKeys} onAssigneeFilterChange={onAssigneeFilterChange} />
                <Layout style={{ padding: '24px' }}>
                    <Heatmap onEvent={onEvent} {...config} />
                </Layout>
                {details.show && 
                <Sider className="site-layout-background" theme="light" width={200} style={{ padding: '20px' }}>
                    <CloseOutlined className="visualizer__details-sider-icon" 
                        onClick={() => setDetails({ ...details, show: false })}
                    />
                    <div>Patent Name: {details.patentId}</div>
                    <div>Sequence Index - Name: {details.seqPosition}</div>
                    <div>Assignee: {details.assignee}</div>
                    <div>Other relevant data: </div>
                    <div>Link to PDF</div>
                    <div>Text extracted</div>
                    <div className="visualizer__edit-button-container">
                        <Button type="primary">Edit Data</Button>
                    </div>
                </Sider>
                }
            </Layout>,
            <PatentTable />
        ]
    )
};

export default PatentVisualizer;