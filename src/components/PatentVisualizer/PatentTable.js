import React from 'react';
import 'antd/dist/antd.css';
import { Table, Space, Checkbox, Button, Tooltip } from 'antd';
import StringManager from '../../utils/StringManager';

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
        dataIndex: 'patentDate',
        key: 'patentDate',
    },
    {
        title: StringManager.get('assignee'),
        dataIndex: 'patentAssignees',
        key: 'patentAssignees',
    },
    {
        title: StringManager.get('claimedResidues'),
        dataIndex: 'claimedResidues',
        key: 'claimedResidues',
    },
    {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
            <Space size="middle">
                <a href={getUSPTODownloadUrl(record.patentNumber)} rel="noreferrer" target="_blank">{StringManager.get('download')}</a>
            </Space>
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
    return <Table columns={getColumns(onPatentNumberFilterChange, displayedPatents, onEditPatent)} dataSource={patentData} />
}

export default PatentTable;