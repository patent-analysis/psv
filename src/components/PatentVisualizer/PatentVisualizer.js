import React, { useState, useEffect, useRef } from 'react';
import { Heatmap } from '@ant-design/charts';
import { Layout } from 'antd';
import PatentVisualizerSidebar from './PatentVisualizerSidebar';
import { assignColors } from '../../utils/colors';
import { getUnique } from '../../utils/utils';
import mock from '../../utils/mockResults';

const KEYS = {
    assignee: 'Assignee',
    sequencePosition: 'Sequence Position',
    patentNumber: 'Patent Number'
}
Object.freeze(KEYS);

const PatentVisualizer = () => {
    const [data, setData] = useState([]);
    const [colorKeys, setColorKeys] = useState({});
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
    const config = {
        width: 650,
        height: 500,
        autoFit: true,
        data: data,
        xField: KEYS.sequencePosition,
        axis: {
            grid: {
                line: {
                    style: {
                        stroke: 'black',
                        lineWidth: 1,
                        strokeOpacity: 0.1,
                        cursor: 'pointer'
                    }
                }
            }
        },
        yField: KEYS.patentNumber,
        colorField: KEYS.assignee,
        color: (assignee) => {
            return colorKeys[assignee];
        },
        showContent: true,
        meta: { [KEYS.sequencePosition] : { type: 'cat' } },
    };
    
    const onEvent = (chart, event) => {
        // TODO
    }
    const onAssigneeFilterChange = (e, name) => {
        setAssignees({
            ...assignees,
            [name]: e.target.checked
        });
    }
    return (
        <Layout>
            <PatentVisualizerSidebar assignees={assignees} onAssigneeFilterChange={onAssigneeFilterChange} />
            <Layout style={{ padding: '24px' }}>
                <Heatmap onEvent={onEvent} {...config} />
            </Layout>
        </Layout>
    )
};

export default PatentVisualizer;