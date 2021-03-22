import React from 'react';
import 'antd/dist/antd.css';
import { Table, Tag, Space } from 'antd';

const columns = [
    {
        title: 'Patent Number',
        dataIndex: 'name',
        key: 'name',
        render: text => <a href="/">{text}</a>,
    },
    {
        title: 'Issue Date',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Assignee',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Tags',
        key: 'tags',
        dataIndex: 'tags',
        render: tags => (
            <>
                {tags.map(tag => {
                    let color = tag.length > 5 ? 'geekblue' : 'green';
                    if (tag === 'soon to expire') {
                        color = 'volcano';
                    }
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    );
                })}
            </>
        ),
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

const data = [
    {
        key: '1',
        name: '11223333',
        age: '02/01/01',
        address: 'Pfizer',
        tags: ['new', 'in court'],
    },
    {
        key: '2',
        name: '11223567',
        age: '02/01/01',
        address: 'Amgen',
        tags: ['other attr'],
    },
    {
        key: '3',
        name: '71223567',
        age: '01/01/01',
        address: 'Regeneron',
        tags: ['soon to expire', 'attribute'],
    },
];
const PatentTable= () => {
    return <Table columns={columns} dataSource={data} />
}

export default PatentTable;