import React from 'react';
import 'antd/dist/antd.css';
import { Table, Space } from 'antd';
import StringManager from '../../utils/StringManager';


// claimedResidues: "197, 237, 238, 239, 367, 369"
// patentAssignees: "Regeneron Pharmaceuticals, Inc.,Tarrytown, NY (US)"
// patentDate: "2016-07-12"
// patentFiled: "2009-12-15"
// patentLegalOpinion: ""
// patentName: "BEST ANTIBODIES TO PCSK9"
// patentNumber: "US00801234567"
// patentSeqListing: "PCSK9_SeqList"
// patentSequences 0: {epitopeResidues: "153, 159, 238, 343, 366", seqId: "755"}
const columns = [
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
                <a href="/">Hide in Visualization</a>
            </Space>
        ),
    },
];

const PatentTable= (props) => {
    return <Table columns={columns} dataSource={props.patentData} />
}

export default PatentTable;