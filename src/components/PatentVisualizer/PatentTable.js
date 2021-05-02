import React from 'react';
import 'antd/dist/antd.css';
import { Table, Modal, Checkbox, Button, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import StringManager from '../../utils/StringManager';
const { Title } = Typography;
const getLensUrl = (patent) => `https://www.lens.org/lens/search/patent/list?q=${patent}&preview=true`
const getUSPTODownloadUrl = (patent) => `https://pdfpiw.uspto.gov/.piw?Docid=${patent}&idkey=NONE&homeurl=http%3A%252F%252Fpatft.uspto.gov%252Fnetahtml%252FPTO%252Fpatimg.htm`

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
            const date = new Date(record.createdDate);
            var month = date.getUTCMonth() + 1; //months from 1-12
            var day = date.getUTCDate();
            var year = date.getUTCFullYear();

            return (
                <p>{`${month}/${day}/${year}`}</p>
            )
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
                <p>{StringManager.get('mentionedResidues')} <InfoCircleOutlined /></p>
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
                            <p>{mention.claimedResidues.filter((residue) => residue).join(', ')}</p>
                        </div>
                    )
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
                            <p>{mention.claimedResidues.filter((residue) => residue).join(', ')}</p>
                        </div>
                    )
                }
                return null;
            })
            return elements;
        }
    },
    {
        title: 'Action',
        align: 'center',
        key: 'action',
        render: (text, record) => (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a href={getUSPTODownloadUrl(record.patentNumber)} style={{ margin: 'auto' }}rel="noreferrer" target="_blank">{StringManager.get('download')}</a>
                <Button type="link" onClick={() => {
                    Modal.info({
                        title: `${StringManager.get('legalOpinion')} ${record.patentNumber}`,
                        content: record.patentLegalOpinion
                    });
                }}>
                    {StringManager.get('legalOpinion')}
                </Button>
            </div>
        ),
    },
    {
        title: 'Edit',
        key: 'edit',
        render: (__text, record) => (
            <Button type="primary" onClick={() => onEditPatent(record.patentNumber)}>Edit</Button>
        ),
    },
];

const PatentTable= ({ patentData, onPatentNumberFilterChange, displayedPatents, onEditPatent }) => {
    return <Table bordered columns={getColumns(onPatentNumberFilterChange, displayedPatents, onEditPatent)} dataSource={patentData} />
}

export default PatentTable;