import React, { useState, useEffect, useRef } from 'react';
import 'antd/dist/antd.css';
import './PatentVisualizer.css';
import { CloseOutlined } from '@ant-design/icons';
import { Heatmap, G2 } from '@ant-design/charts';
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
    patentNumber: 'Patent Number',
    claimed: 'Claimed',
    aminoAcid: 'Amino Acid',
    baseline: 'Sequence'
}
Object.freeze(KEYS);

const getMaximumSeq = (patentArray) => {
    return patentArray.reduce((max, current) => {
        const seqPosition = parseInt(current[KEYS.sequencePosition]);
        if(seqPosition > max) {
            return seqPosition;
        } else {
            return max;
        }
    }, 0);
}

const PatentVisualizer = () => {

    G2.registerShape('polygon', 'boundary-polygon', {
        draw: function draw(cfg, container) {
            var group = container.addGroup();
            var points = cfg.points;
            var attrs = {
                fill: cfg.color,
                path: [],
            };
          
            var path = [
                ['M', points[0].x, points[0].y],
                ['L', points[1].x, points[1].y],
                ['L', points[2].x, points[2].y],
                ['L', points[3].x, points[3].y],
                ['Z'],
            ];
            attrs.path = this.parsePath(path);
            group.addShape('path', { attrs: attrs });
            if (cfg.data[KEYS.sequencePosition] === details.seqPosition) {
                var linePath = [
                    ['M', points[0].x, points[0].y],
                    ['L', points[1].x, points[1].y],
                    ['L', points[2].x, points[2].y],
                    ['L', points[3].x, points[3].y],
                    ['Z'],
                ];
                group.addShape('path', {
                    attrs: {
                        path: this.parsePath(linePath),
                        lineWidth: 4,
                        stroke: '#404040',
                    },
                });
            }
            return group;
        },
    });

    const [data, setData] = useState([]);
    const [colorKeys, setColorKeys] = useState({});
    const [details, setDetails] = useState({ show: false, patentId: 0, seqPosition: 0 });
    const [showBaseline, setBaseline] = useState(false);
    const _dataRef = useRef([]);
    useEffect(() => {
        asyncFetch();
    }, []);

    // Filtering Effect
    const [assignees, setAssignees] = useState({});
    const [sequenceRange, setSequenceRange] = useState({ min: 1, max: 1, length: 1 });
    useEffect(() => {
        setData(_dataRef.current
            // By Assignee
            .filter(patentData => {
                // We remove the baseline sequence of this filter as it is not really an assignee but we need to format data that way
                return assignees[patentData[KEYS.assignee]] || patentData[KEYS.assignee] === KEYS.baseline;
            })
            // By Sequence Range
            .filter((patentData) => {
                return sequenceRange.min <= patentData[KEYS.sequencePosition] && patentData[KEYS.sequencePosition] <= sequenceRange.max;
            })
        );
    }, [assignees, sequenceRange, showBaseline]);
    

    const asyncFetch = () => {
        Promise.resolve(mock)
            .then((response) => {
                setData(response);
                _dataRef.current = response;
                // We remove baseline of assignee set as it is not really an assignee but we need to format data that way
                const uniqueAssignees = getUnique(response, KEYS.assignee).filter((assignee) => assignee !== KEYS.baseline);
                let assigneeFilters = {
                };
                uniqueAssignees.forEach((item) => {
                    assigneeFilters[item] = true;
                });
                setAssignees(assigneeFilters);
                setColorKeys(assignColors(uniqueAssignees));
                const maximumSeq = getMaximumSeq(response);
                setSequenceRange({ min: 1, max: maximumSeq > 30 ? 30 : maximumSeq, length: maximumSeq });
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
        shape: 'boundary-polygon',
        color: (assignee) => {
            if (assignee !== KEYS.baseline) {
                return colorKeys[assignee];
            } else {
                return 'transparent';
            }
        },
        label: {
            offset: -2,
            style: {
                fill: 'black',
                shadowBlur: 2,
                shadowColor: 'rgba(0, 0, 0, .45)',
            },
            formatter: (residueData) => {
                if(residueData[KEYS.patentNumber] === KEYS.baseline && showBaseline) {
                    return residueData[KEYS.aminoAcid];
                }
            }
        },
        showContent: true,
        meta: { [KEYS.patentNumber] : { type: 'cat' } },
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

    const onSequenceRangeFilterChange = (newRange) => {
        setSequenceRange({
            ...sequenceRange,
            ...newRange
        });
    }

    const toggleBaseline = (e) => {
        setBaseline(e.target.checked);
    }

    return (
        [
            <Layout>
                <PatentVisualizerSidebar assignees={assignees} colorKeys={colorKeys} sequenceRange={sequenceRange} sequenceLength={data.length} showBaseline={showBaseline}
                    onAssigneeFilterChange={onAssigneeFilterChange} 
                    onSequenceRangeFilterChange={onSequenceRangeFilterChange}
                    toggleBaseline={toggleBaseline}
                />
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