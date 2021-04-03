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
import { useLocation } from 'react-router-dom';
import { API } from 'aws-amplify';
const { Sider } = Layout;

const KEYS = {
    assignee: 'patentAssignees',
    sequencePosition: 'sequencePosition',
    patentNumber: 'patentNumber'
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

function getPatentData(proteinId){
    /**
     * Fetch patent details from the patents database for the given $proteinId
     */
    const apiName = 'patentsAPI';
    const path = '/patents'; 
    const myInit = { 
        headers: {}, 
        response: false, // Only return response.data
        queryStringParameters: {  
            'proteinId': proteinId
        }
    };

    console.log('Calling API', apiName, path, myInit)
    return API.get(apiName, path, myInit);
}

function generateVisualizationDataset(patentData) {
    /**
     * The $patentData retrieved from the patents database contains comma-separated
     * lists of claimed residues. This function explodes the patentData to generate JSONs
     * for every claimed reside - to build the heat map visualization.
     */
    var visualizationDataset = [];
    var i = 0;

    patentData.forEach((patentInfo) => {
        const assignee = patentInfo[KEYS.assignee]
        const patentNumber = patentInfo[KEYS.patentNumber]
        const residues = patentInfo['claimedResidues']
        const residuesList = residues.split(',')

        residuesList.forEach((sequencePosition) => {
            const visualizationData = {
                'patentAssignees': assignee,
                'patentNumber': patentNumber,
                'sequencePosition': sequencePosition.trim()
            };
            visualizationDataset[i] = visualizationData;
            i++;
        });
        
    });
    return visualizationDataset;
}

const PatentVisualizer = props => {
    const location = useLocation();

    const [data, setData] = useState([]);
    const [colorKeys, setColorKeys] = useState({});
    const [details, setDetails] = useState({ show: false, patentId: 0, seqPosition: 0 });
    const _dataRef = useRef([]);

    useEffect(() => {
        const proteinName = location.state.proteinName;
        console.log('Fetching patent details for', proteinName)
        const patentData = getPatentData(proteinName);
        setPatentData(patentData);
    }, []);

    // Filtering Effect
    const [assignees, setAssignees] = useState({});
    const [sequenceRange, setSequenceRange] = useState({ min: 1, max: 1, length: 1 });
    useEffect(() => {
        setData(_dataRef.current
            // By Assignee
            .filter(patentData => {
                return assignees[patentData[KEYS.assignee]]
            })
            // By Sequence Range
            .filter((patentData) => {
                return sequenceRange.min <= patentData[KEYS.sequencePosition] && patentData[KEYS.sequencePosition] <= sequenceRange.max;
            })
        );
    }, [assignees, sequenceRange]);

    const setPatentData = (patentData) => {
        Promise.resolve(patentData)
            .then((patentData) => {
                console.debug('Patent Data: ', patentData)

                //Generate individual data points for the heat map based on the patent data
                const response = generateVisualizationDataset(patentData)

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
                const maximumSeq = getMaximumSeq(response);
                setSequenceRange({ min: 1, max: maximumSeq, length: maximumSeq });
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

    const onSequenceRangeFilterChange = (newRange) => {
        setSequenceRange({
            ...sequenceRange,
            ...newRange
        });
    }
    return (
        [
            <Layout>
                <PatentVisualizerSidebar assignees={assignees} colorKeys={colorKeys} sequenceRange={sequenceRange} sequenceLength={data.length}
                    onAssigneeFilterChange={onAssigneeFilterChange} 
                    onSequenceRangeFilterChange={onSequenceRangeFilterChange}
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
            //TODO: PatentTable to be populated with $patentData 
            <PatentTable />
        ]
    )
};

export default PatentVisualizer;