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
import { getPatentData, generateVisualizationDataset, savePatentData, sortDataset, mergeSequenceWithResidues, postAlignSequences } from '../../utils/patentDataUtils';
import { AMINO_ACID_CODE, AMINO_THREE_LETTER_CODE } from '../../utils/aminoAcidTable';
import { useLocation, useHistory } from 'react-router-dom';
import EditModalDialog from '../EditDataModal/EditDataModal'
import StringManager from '../../utils/StringManager';

const { Title } = Typography;
const { Sider } = Layout;

const KEYS = {
    assignee: 'patentAssignees',
    sequencePosition: 'sequencePosition',
    patentNumber: 'patentNumber',
    patentNumberAndSeq: 'patentNumberAndSeq',
    claimed: 'Claimed',
    aminoAcid: 'Amino Acid',
    baseline: 'Sequence',
    patentName: 'Patent Name',
    patentFiled: 'Patent Filed',
    seqId: 'seqId'
}
Object.freeze(KEYS);

const EXPAND_CHART_QUERY_PARAM = 'expandChart'

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
                'Amino Acid': char,
                'patentNumberAndSeq': `${KEYS.baseline}_${name}`,
                'Claimed': false,
            }
        });
}


const G2DrawResidues = (details, colors) => {
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
            let fillColor;
            if(cfg.data.Claimed) {
                fillColor = colors[cfg.data.patentAssignees];
            } else if(cfg.data.patentAssignees.includes(KEYS.baseline)) {
                fillColor = 'transparent';
            }
            const attrs = {
                fill: fillColor,
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

const alignDisplayedData = async (data) => {
    const alignedFormat = data.map((patent) => ({ 
        docId: patent.docId, 
        seqs: patent.mentionedResidues.map((seqInfo) => ({ 
            ...seqInfo, 
            value: seqInfo.value.map((threeLetterAmino) => AMINO_THREE_LETTER_CODE[threeLetterAmino]) 
        }))
    }));
    try {
        const alignedData = await postAlignSequences(alignedFormat);
        return data.map((patent, index) => {
            return {
                ...patent, 
                mentionedResidues: alignedData.message[index].seqs
                    .map((sequence) => ({ 
                        ...sequence, 
                        value: sequence.value
                            .map((singleLetterAmino) => AMINO_ACID_CODE[singleLetterAmino]) 
                    })) 
            }
        });
    } catch (error) {
        return data;
    }
}

const alignManualSequence = async (data, manualSequence = []) => {
    const alignedFormat = data.map((patent) => ({ 
        docId: patent.docId, 
        seqs: patent.mentionedResidues.map((seqInfo) => ({ 
            ...seqInfo, 
            value: seqInfo.value.map((threeLetterAmino) => AMINO_THREE_LETTER_CODE[threeLetterAmino]) 
        }))
    }));
    try {
        const alignedData = await postAlignSequences(alignedFormat.concat(manualSequence));
        // We only care about the result of the new manual sequence
        return alignedData.message[alignedData.message.length - 1];
    } catch (error) {
        console.log('Error during alignment', error);
        return data;
    }
}

const PatentVisualizer = props => {
    const location = useLocation();
    const history = useHistory();
    const query = new URLSearchParams(location.search);
    const proteinName = query.get('proteinName');
    const shouldExpand = query.get(EXPAND_CHART_QUERY_PARAM) || 'false';
    const [data, setData] = useState([]);
    const [colorKeys, setColorKeys] = useState({});
    const [details, setDetails] = useState({ show: false, patentId: 0, seqPosition: 0, patentName: '', seqId: '', aminoAcid: '' });
    const [showBaseline, setBaseline] = useState(false);
    const [tableDetails, setTableDetails] = useState([]);
    const [loading, isLoading] = useState(true);
    const [manualSequenceList, setManualSequenceList] = useState([]);
    let _chartRef;
    const _dataRef = useRef([]);
    const _patentDetailRef = useRef([]);
    const [modalShow, setModalShow] = React.useState(false);
    const [editPatentDetails, setEditPatentDetails] = useState({});
    G2DrawResidues(details, colorKeys);
    useEffect(() => {
        (async function () {
            try {
                const patentData = await getPatentData(proteinName);
                const structuredPatentData = mergeSequenceWithResidues(patentData);
                _patentDetailRef.current = structuredPatentData;
                const alignedPatentData = await alignDisplayedData(structuredPatentData);
                if(!patentData || patentData.length === 0) {
                    throw Error('no data');
                }
                isLoading(false);
                setPatentData(alignedPatentData);
            } catch(error) {
                const titleExtension = proteinName === null ? StringManager.get('proteinNotFound') : proteinName; 
                Modal.error({
                    title: StringManager.get('proteinNotFoundTitle') + titleExtension,
                    content: StringManager.get('proteinNotFoundDesc') + `\n Send developers this error message: ${error.message} ${error.stack}`
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
        autoFit: shouldExpand === 'false',
        data: data,
        xField: KEYS.sequencePosition,
        xAxis: gridStyles,
        yAxis: gridStyles,
        yField: KEYS.patentNumberAndSeq,
        colorField: KEYS.assignee,
        shape: 'boundary-polygon',
        tooltip: {
            customContent: (title, data) => {
                if(data.length > 0 && !data[0].data[KEYS.patentNumber].includes(KEYS.baseline)) {
                    return (`
                        <div class="chartTooltip__container">
                            <p class="chartTooltip__line">${title}</p>
                            <p class="chartTooltip__line">SEQ ID: ${data[0].data[KEYS.seqId]}</p>
                            <p class="chartTooltip__line">${data[0].name}</p>
                            <p class="chartTooltip__line">${data[0].data[KEYS.patentNumber]}</p>
                            <p class="chartTooltip__line"><span>Amino Acid:     <span><span>${data[0].data[KEYS.aminoAcid]}<span></p>
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
                    return AMINO_THREE_LETTER_CODE[residueData[KEYS.aminoAcid]] || residueData[KEYS.aminoAcid];
                } else if(residueData.Claimed && showBaseline) {
                    return AMINO_THREE_LETTER_CODE[residueData[KEYS.aminoAcid]];
                }
            }
        },
        showContent: true,
        meta: { [KEYS.patentNumber]: { type: 'cat' } },
    };
    
    const onEvent = (__chart, event) => {
        // If event.data is not available user clicked on empty tile of heatmap
        if (event.type === 'click' && event.data) {
            const position = parseInt(event.data.data[KEYS.sequencePosition]);
            setSequenceRange(currentRange => ({ min: position - 20, max: position + 20, length: currentRange.length }));
            setDetails({
                show: true,
                aminoAcid: event.data.data[KEYS.aminoAcid],
                seqId: event.data.data.seqId,
                patentName: event.data.data.patentName,
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
        
    const addManualSequence = async (sequence = '', name) => {
        isLoading(true);
        const alignFormattedManualSeq =  {
            docId: name, 
            seqs: [{
                seqId: '0',
                location: 'manual',
                claimedResidues: [],
                value: sequence.split('')
            }]
        }

        const alignedData = await alignManualSequence(_patentDetailRef.current, alignFormattedManualSeq);
        // Sequence is passed as a String, we need to format the data to send to the chart
        const newSequence = sequenceStringToArray(alignedData.seqs[0].value.join(''), name);
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
        isLoading(false);
    }

    const toggleManualSeq = (seqName, toggle) => {
        const newSeqList = manualSequenceList.map((seq) => {
            return seqName === seq.name ? { show: toggle, name: seq.name } : seq;
        });
        setManualSequenceList(newSeqList);
    }

    const onRenderFullChart = () => {
        if(history.location.search.includes(`${EXPAND_CHART_QUERY_PARAM}=true`)) {
            const currentUrl = history.location.search;
            history.push({
                search: currentUrl.replace(`${EXPAND_CHART_QUERY_PARAM}=true`,`${EXPAND_CHART_QUERY_PARAM}=false`),
            });
        } else if(history.location.search.includes(`${EXPAND_CHART_QUERY_PARAM}=false`)) { 
            const currentUrl = history.location.search;
            history.push({
                search: currentUrl.replace(`${EXPAND_CHART_QUERY_PARAM}=false`,`${EXPAND_CHART_QUERY_PARAM}=true`),
            });
        } else {
            history.push({
                search: `${history.location.search}&${EXPAND_CHART_QUERY_PARAM}=true`,
            });
        }
        window.location.reload();
    }

    const getChartRef = (chartElement) => {
        if(chartElement) {
            _chartRef = chartElement.getChart();
        }
    }

    return (
        [
            <Title style={{ marginTop: 20, marginBottom: 20 }} level={3}> {`${StringManager.get('resultsFor')} ${proteinName || ''}:`} </Title>,
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
                <PatentVisualizerSidebar shouldExpand={shouldExpand === 'true'} assignees={assignees} colorKeys={colorKeys} sequenceRange={sequenceRange} sequenceLength={data.length} showBaseline={showBaseline}
                    manualSequenceList={manualSequenceList}
                    toggleManualSeq={toggleManualSeq}
                    onAssigneeFilterChange={onAssigneeFilterChange} 
                    onSequenceRangeFilterChange={onSequenceRangeFilterChange}
                    toggleBaseline={toggleBaseline}
                    addManualSequence={addManualSequence}
                    downloadChart={downloadChart}
                    onRenderFullChart={onRenderFullChart}
                />
                <Layout style={{ padding: '24px', overflow: 'auto' }}>
                    <Heatmap ref={getChartRef} onEvent={(__chart, event) => onEvent(__chart, event)} {...config} />
                </Layout>
                {details.show &&
                    <Sider className="site-layout-background" theme="light" width={200} style={{ padding: '20px' }}>
                        <CloseOutlined className="visualizer__details-sider-icon"
                            onClick={() => {
                                setDetails({ ...details, show: false });
                            }}
                        />
                        <Title level={5}>Patent Number</Title>
                        <p>{details.patentId}</p>
                        <Title level={5}>Patent Name</Title>
                        <p>{details.patentName}</p>
                        <Title level={5}>Assignee</Title>
                        <p>{details.assignee}</p>
                        <Title level={5}>Residue details</Title>
                        <p>Position: {details.seqPosition}</p>
                        <p>SEQ ID: {details.seqId}</p>
                        <p>Amino acid: {details.aminoAcid}</p>
                        <p>See patent table for more details</p>
                        
                    </Sider>
                }
            </Layout>,
            <Title style={{ marginTop: 20, marginBottom: 20 }} level={3}>Patent Details Table</Title>,
            <PatentTable patentData={tableDetails} onEditPatent={onEditPatent} onPatentNumberFilterChange={onPatentNumberFilterChange} displayedPatents={displayedPatents} />
        ]
    )
};

export default PatentVisualizer;