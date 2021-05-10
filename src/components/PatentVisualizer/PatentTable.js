import React from 'react';
import 'antd/dist/antd.css';
import { Table, Modal, Checkbox, Button, Tooltip, Typography, List } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import StringManager from '../../utils/StringManager';
import { AMINO_THREE_LETTER_CODE } from '../../utils/aminoAcidTable';
const { Title } = Typography;
const getLensUrl = (patent) => `https://www.lens.org/lens/search/patent/list?q=${patent}&preview=true`

// ["1", "239", "240", "241", "339", "340", "341", "342", 
// "343", "364", "366", "367", "368", "369", "370", "391", "442", "443", "444"]
const collapseResidueRanges = (residueArray = [], sequence = []) => {
    const newArray = [];
    let previousValue = residueArray[0];
    let count = 0;
    for(let i = 1; i < residueArray.length; i++) {
        if(parseInt(residueArray[i]) === (parseInt(previousValue) + count + 1)) {
            // We are in range
            count++;
        } else {
            const intPreviousValue = parseInt(previousValue);
            if(count === 0) {
                // We push the previousValue, current value might still be part of a range. 
                // It is just not the end of the previous one
                // We substract one as the sequence array is 0 index but the sequence references are not
                const sequenceCode = sequence.length > previousValue ? AMINO_THREE_LETTER_CODE[sequence[intPreviousValue - 1]] : '';
                newArray.push(`${sequenceCode}${previousValue}`);
            } else {
                const firstCode = sequence.length > previousValue ? AMINO_THREE_LETTER_CODE[sequence[intPreviousValue - 1]] : '';
                const lastCode = sequence.length > parseInt(previousValue) + count ? AMINO_THREE_LETTER_CODE[sequence[intPreviousValue + count - 1]] : '';
                newArray.push(`${firstCode}${previousValue}-${lastCode}${intPreviousValue + count}`);
            }
            previousValue = residueArray[i];
            count = 0;
        }
    }
    // If last element was part of a range
    if(count) {
        const intPreviousValue = parseInt(previousValue);
        const firstCode = sequence.length > previousValue ? AMINO_THREE_LETTER_CODE[sequence[intPreviousValue - 1]] : '';
        const lastCode = sequence.length > intPreviousValue + count ? AMINO_THREE_LETTER_CODE[sequence[intPreviousValue + count - 1]] : '';
        newArray.push(`${firstCode}${previousValue}-${lastCode}${intPreviousValue + count}`);
    }
    return newArray;
}
const getColumns = (toggleShow, displayedPatents, onEditPatent) => [
    {
        title: '',
        key: 'show',
        render: (__text, record) => (
            <Tooltip
                trigger={['hover']}
                title={StringManager.get('patentHideShow')}
                placement="topLeft"
            >
                <Checkbox onChange={() => toggleShow(record.patentNumber)} 
                    checked={displayedPatents[record.patentNumber]}
                />
            </Tooltip>
        ),
    },
    {
        title: StringManager.get('patentNumber'),
        dataIndex: 'patentNumber',
        key: 'patentNumber',
        render: text => <a href={getLensUrl(text)} rel="noreferrer" target="_blank">{text}</a>,
    },
    {
        title: StringManager.get('patentName'),
        dataIndex: 'patentName',
        key: 'patentName',
    },
    {
        title: StringManager.get('issueDate'),
        dataIndex: 'createdDate',
        key: 'createdDate',
        render: (text, record) => {
            const date = new Date(record.patentFiled);
            var month = date.getUTCMonth() + 1; //months from 1-12
            var day = date.getUTCDate();
            var year = date.getUTCFullYear();
            if(isNaN(month) || isNaN(year) || isNaN(day)) {
                return <p style={{ marginBottom: 0 }}>-</p>
            } else {
                return <p style={{ marginBottom: 0 }}>{`${month}/${day}/${year}`}</p>
            }
        }
    },
    {
        title: 'Filed',
        dataIndex: 'appDate',
        key: 'appDate',
        render: (text, record) => {
            const date = new Date(record.appDate);
            var month = date.getUTCMonth() + 1; //months from 1-12
            var day = date.getUTCDate();
            var year = date.getUTCFullYear();
            if(isNaN(month) || isNaN(year) || isNaN(day)) {
                return <p style={{ marginBottom: 0 }}>-</p>
            } else {
                return <p style={{ marginBottom: 0 }}>{`${month}/${day}/${year}`}</p>
            }
        }
    },
    {
        title: StringManager.get('assignee'),
        dataIndex: 'patentAssignees',
        key: 'patentAssignees',
    },
    {
        title: StringManager.get('inventors'),
        dataIndex: 'inventors',
        key: 'inventors',
    },
    {
        title: () => (
            <Tooltip
                trigger={['hover']}
                title={StringManager.get('mentionedResiduesTooltip')}
                placement="topLeft"
            >
                <p style={{ marginBottom: 0 }}>{StringManager.get('mentionedResidues')} <InfoCircleOutlined /></p>
            </Tooltip>
        ),
        dataIndex: 'mentionedResidues',
        key: 'mentionedResidues',
        render: (text, record) => {
            const elements = record.mentionedResidues.map((mention, index) => {
                if(mention.location !== 'claim') {
                    return (
                        <div key={`${mention.seqId}_${index}`}>
                            <Title level={5}>SEQ ID: {mention.seqId}</Title>
                            <p>{collapseResidueRanges(mention.claimedResidues, mention.value).filter((residue) => residue).join(', ')}</p>
                            { mention.statements && mention.statements.length > 0 && 
                                <Button type="link" style={{ padding: 0 }} onClick={() => {
                                    Modal.info({
                                        title: `Epitope Mentions: ${record.patentNumber}`,
                                        content: (    
                                            <List
                                                dataSource={mention.statements}
                                                renderItem={item => (
                                                    <List.Item>
                                                        {item}
                                                    </List.Item>
                                                )}
                                            />)
                                    });
                                }}>
                                    See mentions
                                </Button>
                            }
                        </div>
                    );
                }
                return null;
            })
            return elements;
        }
    },
    {
        title: StringManager.get('claimedResidues'),
        dataIndex: 'mentionedResidues',
        key: 'mentionedResidues',
        render: (text, record) => {
            const elements = record.mentionedResidues.map((mention, index) => {
                if(mention.location === 'claim') {
                    return (
                        <div key={`${mention.seqId}_${index}`}>
                            <Title level={5}>SEQ ID: {mention.seqId}</Title>
                            <p>{collapseResidueRanges(mention.claimedResidues, mention.value).filter((residue) => residue).join(', ')}</p>
                            { mention.statements && mention.statements.length > 0 && 
                                <Button type="link" style={{ padding: 0 }} onClick={() => {
                                    Modal.info({
                                        title: `Epitopes Claimed: ${record.patentNumber}`,
                                        content: (    
                                            <List
                                                dataSource={mention.statements}
                                                renderItem={item => (
                                                    <List.Item>
                                                        {item}
                                                    </List.Item>
                                                )}
                                            />)
                                    });
                                }}>
                                    See claims extracted
                                </Button>
                            }
                        </div>
                    );
                }
                return null;
            })
            return elements;
        }
    },
    {
        title: 'Actions',
        align: 'center',
        key: 'action',
        render: (text, record) => (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Button type="primary" href={record.patentDocPath} style={{ margin: '10px auto' }} rel="noreferrer" target="_blank">{StringManager.get('download')}</Button>
                <Button type="primary" style={{ margin: '10px auto' }} onClick={() => {
                    Modal.info({
                        title: `${StringManager.get('legalOpinion')} ${record.patentNumber}`,
                        content: record.patentLegalOpinion
                    });
                }}>
                    {StringManager.get('legalOpinion')}
                </Button>
                <Button type="primary" style={{ margin: '10px auto' }} onClick={() => onEditPatent(record.patentNumber)}>Edit Patent Data</Button>
            </div>
        ),
    }
];

const PatentTable= ({ patentData, onPatentNumberFilterChange, displayedPatents, onEditPatent }) => {
    return <Table sticky bordered columns={getColumns(onPatentNumberFilterChange, displayedPatents, onEditPatent)} dataSource={patentData} />
}

export default PatentTable;