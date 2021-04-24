import React from 'react';
import 'antd/dist/antd.css';
import { Table, Space, Checkbox, Button } from 'antd';
import StringManager from '../../utils/StringManager';

const getColumns = (toggleShow, displayedPatents, onEditPatent) => [
    {
        title: '',
        key: 'show',
        render: (__text, record) => (
            <Checkbox onChange={() => toggleShow(record.patentNumber)} 
                checked={displayedPatents[record.patentNumber]}
            />
        ),
    },
    {
        title: StringManager.get('patentNumber'),
        dataIndex: 'patentNumber',
        key: 'patentNumber',
        render: text => <a href="/">{text}</a>,
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
                <a href="/">Download {record.name}</a>
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