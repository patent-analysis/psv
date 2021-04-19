import React from 'react';
import 'antd/dist/antd.css';
import { Table, Space, Checkbox } from 'antd';
import StringManager from '../../utils/StringManager';

const getColumns = (toggleShow, displayedPatents) => [
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
];

const PatentTable= ({ patentData, onPatentNumberFilterChange, displayedPatents }) => {
    return <Table columns={getColumns(onPatentNumberFilterChange, displayedPatents)} dataSource={patentData} />
}

export default PatentTable;