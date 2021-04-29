import React, { useState, useEffect, useRef } from 'react';
import 'antd/dist/antd.css';
import './PatentVisualizer.css';
import { CloseOutlined } from '@ant-design/icons';
import { Heatmap, G2 } from '@ant-design/charts';
import { Modal, Layout, Spin, Typography } from 'antd';
import PatentVisualizerSidebar from './PatentVisualizerSidebar';
import PatentTable from './PatentTable';
import { assignColors } from '../../utils/colors';
import { getUnique } from '../../utils/utils';
import { getPatentData, generateVisualizationDataset, savePatentData, sortDataset } from '../../utils/patentDataUtils';
import { useLocation } from 'react-router-dom';
import EditModalDialog from '../EditDataModal/EditDataModal'
import StringManager from '../../utils/StringManager';

const { Title } = Typography;
const { Sider } = Layout;

const KEYS = {
    assignee: 'patentAssignees',
    sequencePosition: 'sequencePosition',
    patentNumber: 'patentNumber',
    claimed: 'Claimed',
    aminoAcid: 'Amino Acid',
    baseline: 'Sequence',
    patentName: 'Patent Name',
    patentFiled: 'Patent Filed',
}
Object.freeze(KEYS);

const getMaximumSeq = (patentArray) => {
    return patentArray.reduce((max, current) => {
        const seqPosition = parseInt(current[KEYS.sequencePosition]);
        if (seqPosition > max) {
            return seqPosition;
        } else {
            return max;
        }
    }, 0);
}
const sequenceStringToArray = (seqString, name) => {
    return seqString.split('')
        // If sequence has spaces ignore them
        .filter((char) => char !== ' ')
        .map((char, index) => {
            return {
                'patentNumber': `${KEYS.baseline}_${name}`,
                'patentAssignees': KEYS.baseline,
                'sequencePosition': (index + 1).toString(),
                'Amino Acid': char
            }
        });
}


const G2DrawResidues = (details) => {
    G2.registerShape('polygon', 'boundary-polygon', {
        draw: function draw(cfg, container) {
            const group = container.addGroup();
            const points = cfg.points;
            // Combination of all points surrounding the data
            const path = [
                ['M', points[0].x, points[0].y],
                ['L', points[1].x, points[1].y],
                ['L', points[2].x, points[2].y],
                ['L', points[3].x, points[3].y],
                ['Z'],
            ];
            const attrs = {
                fill: cfg.color,
                path: [],
            };
            attrs.path = this.parsePath(path);
            group.addShape('path', { attrs: attrs });
            // Use the sequence position of the last residue clicked
            if (cfg.data[KEYS.sequencePosition] === details.seqPosition && details.show) {
                group.addShape('path', {
                    attrs: {
                        path: this.parsePath(path),
                        lineWidth: 4,
                        stroke: '#404040',
                    },
                });
            }
            return group;
        },
    });
}

const PatentVisualizer = props => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const proteinName = query.get('proteinName');
    const [data, setData] = useState([]);
    const [colorKeys, setColorKeys] = useState({});
    const [details, setDetails] = useState({ show: false, patentId: 0, seqPosition: 0 });
    const [showBaseline, setBaseline] = useState(false);
    const [tableDetails, setTableDetails] = useState([]);
    const [loading, isLoading] = useState(true);
    const [manualSequenceList, setManualSequenceList] = useState([]);
    let _chartRef;

    const _dataRef = useRef([]);
    const [modalShow, setModalShow] = React.useState(false);
    const [editPatentDetails, setEditPatentDetails] = useState({});
    G2DrawResidues(details);
    useEffect(() => {
        (async function () {
            try {
                const patentData = await getPatentData(proteinName);
                if(!patentData || patentData.length === 0) {
                    throw Error('no data');
                }
                isLoading(false);
                setPatentData(patentData);
            } catch(error) {
                const titleExtension = proteinName === null ? StringManager.get('proteinNotFound') : proteinName; 
                Modal.error({
                    title: StringManager.get('proteinNotFoundTitle') + titleExtension,
                    content: StringManager.get('proteinNotFoundDesc')
                });
            }
        })();
    }, [proteinName]);

    // Filtering Effect
    const [assignees, setAssignees] = useState({});
    const [sequenceRange, setSequenceRange] = useState({ min: 1, max: 1, length: 1 });
    const [displayedPatents, setDisplayedPatents] = useState({});
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
            // By Patent Number
            .filter((patentData) => {
                return displayedPatents[patentData.patentNumber] || patentData.patentNumber.includes(KEYS.baseline); 
            })
            // By Manual Sequence Name
            .filter((patentData) => {
                const findSeq = manualSequenceList.find(elem => `${KEYS.baseline}_${elem.name}` === patentData.patentNumber);
                return findSeq !== undefined ? findSeq.show : true;
            })
        );
    }, [assignees, sequenceRange, showBaseline, displayedPatents, manualSequenceList]);

    const setPatentData = (patentData) => {
        console.debug('Patent Data: ', patentData);
        //Generate individual data points for the heat map based on the patent data
        // Create object using patent numbers as keys: { US00801234567: true, US008065732AA: true }
        const patentNumbers = patentData.reduce((prev, current) => {
            return { ...prev, [current.patentNumber]: true }
        }, {})
        setTableDetails(patentData);
        setDisplayedPatents(patentNumbers);
        // Generate individual data points for the heat map based on the patent data
        const response = generateVisualizationDataset(patentData)

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
        setSequenceRange({ min: 1, max: maximumSeq, length: maximumSeq });
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
        width: 3000,
        height: 600,
        autoFit: false,
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
        tooltip: {
            customContent: (title, data) => {
                if(data.length > 0) {
                    return (`
                        <div class="chartTooltip__container">
                            <p>${title}</p>
                            <p>SEQ ID 6</p>
                            <p><span>${data[0].name}:     <span><span>${data[0].value}<span></p>
                            <p><span>Amino Acid:     <span><span>${data[0].data[KEYS.aminoAcid]}<span></p>
                        </div>`);
                }
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
                if(residueData[KEYS.patentNumber].includes(KEYS.baseline) && showBaseline) {
                    return residueData[KEYS.aminoAcid];
                }
            }
        },
        showContent: true,
        meta: { [KEYS.patentNumber]: { type: 'cat' } },
    };
    
    const onEvent = (__chart, event) => {
        // If event.data is not available user clicked on empty tile of heatmap
        if (event.type === 'click' && event.data) {
            setDetails({
                show: true,
                patentId: event.data.data[KEYS.patentNumber],
                assignee: event.data.data[KEYS.assignee],
                seqPosition: event.data.data[KEYS.sequencePosition],
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

    const onPatentNumberFilterChange = (patentNumber) => {
        // We toggle the state of the patent number clicked
        setDisplayedPatents({
            ...displayedPatents,
            [patentNumber]: !displayedPatents[patentNumber]
        });
    }

    const toggleBaseline = (e) => {
        setBaseline(e.target.checked);
    }

    const downloadChart = () => {
        if(_chartRef) {
            _chartRef.downloadImage(`${proteinName}_chart_${sequenceRange.min}-${sequenceRange.max}`);
        }
    }

    const patentEditSubmit = (modifiedPatentDetails) => {
        let pat = tableDetails.find(p => p.patentNumber === editPatentDetails.patentNumber);
        for (const property in modifiedPatentDetails) {
            pat[property] = modifiedPatentDetails[property];
        }
        return savePatentData(pat)
            .then(() => {
                setModalShow(false);
                window.location.reload();
            }).catch((error) => {
                Modal.error({
                    title: StringManager.get('errorPatentEdit'),
                    content: `Error message: ${error}`
                });
            });
        
    }

    const onEditPatent = (patentNumber) => {
        let pat = tableDetails.find(p => p.patentNumber === patentNumber);
        setEditPatentDetails(pat);        
        setModalShow(true);
    }
        
    const addManualSequence = (sequence = '', name) => {
        // Sequence is passed as a String, we need to format the data to send to the chart
        const newSequence = sequenceStringToArray(sequence, name);
        // Sort data to make sure manual sequences are shown at the bottom of the chart
        const newDataset = sortDataset(data.concat(newSequence));
        setData(newDataset);
        _dataRef.current = newDataset;
        // Make sure the slider updates to the maximum length if this sequence is the largest
        if (newSequence.length > sequenceRange.length) {
            setSequenceRange({ ...sequenceRange, length: newSequence.length });
        }

        const isSeqDefined = manualSequenceList.some((elem) => elem.name === name);
        if (!isSeqDefined) {
            setManualSequenceList([...manualSequenceList, { show: true, name }]);
        }

    }

    const toggleManualSeq = (seqName, toggle) => {
        const newSeqList = manualSequenceList.map((seq) => {
            return seqName === seq.name ? { show: toggle, name: seq.name } : seq;
        });
        setManualSequenceList(newSeqList);
    }
    const getChartRef = (chartElement) => {
        if(chartElement) {
            _chartRef = chartElement.getChart();
        }
    }

    return (
        [
            <Title level={3}> {`${StringManager.get('resultsFor')} ${proteinName || ''}:`} </Title>,
            <Layout>
                {modalShow && <EditModalDialog
                    isOpen={modalShow}
                    onHide={() => setModalShow(false)}
                    patentDetails={editPatentDetails}
                    onPatentEditSubmit={patentEditSubmit}
                />}
                <Spin style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%'
                }} tip={'Loading...'} 
                spinning={loading}>
                </Spin>
                <PatentVisualizerSidebar assignees={assignees} colorKeys={colorKeys} sequenceRange={sequenceRange} sequenceLength={data.length} showBaseline={showBaseline}
                    manualSequenceList={manualSequenceList}
                    toggleManualSeq={toggleManualSeq}
                    onAssigneeFilterChange={onAssigneeFilterChange} 
                    onSequenceRangeFilterChange={onSequenceRangeFilterChange}
                    toggleBaseline={toggleBaseline}
                    addManualSequence={addManualSequence}
                    downloadChart={downloadChart}
                />
                <Layout style={{ padding: '24px', overflow: 'auto' }}>
                    <Heatmap ref={getChartRef} onEvent={onEvent} {...config} />
                </Layout>
                {details.show &&
                    <Sider className="site-layout-background" theme="light" width={200} style={{ padding: '20px' }}>
                        <CloseOutlined className="visualizer__details-sider-icon"
                            onClick={() => setDetails({ ...details, show: false })}
                        />
                        <div>Patent Name: {details.patentId}</div>
                        <div>Sequence Index - Name: {details.seqPosition}</div>
                        <div>Assignee: {details.assignee}</div>
                    </Sider>
                }
            </Layout>,
            <PatentTable patentData={tableDetails} onEditPatent={onEditPatent} onPatentNumberFilterChange={onPatentNumberFilterChange} displayedPatents={displayedPatents} />
        ]
    )
};

export default PatentVisualizer;