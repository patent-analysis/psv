import React, { useState } from 'react';
import { Input, Modal, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import StringManager from '../../utils/StringManager';
const { TextArea } = Input;

const getClaimedResidues = (seqId, claimedResidues) => {
    for(let i = 0; i < claimedResidues.length; i++) {
        if(claimedResidues[i].seqId === seqId) {
            return claimedResidues[i];
        }
    }
}
function EditModalDialog(props) {
    const [isModalVisible] = useState(props.isOpen);
    const [assignee, setAssignee] = useState(props.patentDetails.patentAssignees);
    const [patentName, setPatentName] = useState(props.patentDetails.patentName);
    const [patentFiled, setPatentFiled] = useState(props.patentDetails.patentFileDate);
    const [patentDate, setPatentDate] = useState(props.patentDetails.createdDate);
    const [claimed, setClaimed] = useState(props.patentDetails.mentionedResidues);
    const [patentLegalOpinion, setPatentLegalOpinion] = useState(props.patentDetails.patentLegalOpinion);
    const [inventors, setInventors] = useState(props.patentDetails.inventors);
    const [seqIdSelected, setSeqIdSelected] = useState(props.patentDetails.mentionedResidues[0].seqId);
    let residuesBySeqId = [];
    if(claimed) {
        residuesBySeqId = claimed.map((data, index) => (
            <Menu.Item key={index}
                onClick={() => {
                    setSeqIdSelected(data.seqId);
                }}
            >
                <Button type="link">
                    {data.seqId}
                </Button>
            </Menu.Item>
        ));
    }
    const dropdownList = (
        <Menu>
            {residuesBySeqId}
        </Menu>
    )
    const submitPatentDetails = () => {
        const modifiedPatentDetails = {
            'patentAssignees' : assignee,
            'inventors': inventors,
            'patentName' : patentName,
            'patentFiled' : patentFiled,
            'patentDate' : patentDate,
            'mentionedResidues' : claimed,
            'patentLegalOpinion' : patentLegalOpinion
        }

        props.onPatentEditSubmit(modifiedPatentDetails);
    }
    const inputStyle = { marginBottom: 20 };
    return (
        <Modal
            title={StringManager.get('editModalTitle') + ' ' + props.patentDetails.patentNumber}
            visible={isModalVisible}
            onOk={submitPatentDetails}
            onCancel={props.onHide}
        >
            <div>
                {StringManager.get('assignee') + ': '}
                <Input style={inputStyle} value={assignee}
                    onChange={(e) => {
                        setAssignee(e.target.value)
                    }} />
                {StringManager.get('inventors') + ': '}
                <Input style={inputStyle} value={inventors}
                    onChange={(e) => {
                        setInventors(e.target.value)
                    }} />
                {StringManager.get('patentName') + ': '}
                <Input style={inputStyle} value={patentName}
                    onChange={(e) => {
                        setPatentName(e.target.value)
                    }} />
                {StringManager.get('patentFiled') + ': '}
                <Input style={inputStyle} value={patentFiled}
                    onChange={(e) => {
                        setPatentFiled(e.target.value)
                    }} />
                {StringManager.get('patentDate') + ': '}
                <Input style={inputStyle}value={patentDate}
                    onChange={(e) => {
                        setPatentDate(e.target.value)
                    }} />
                <Dropdown overlay={dropdownList} trigger={['click']}>
                    <Button style={{ paddingLeft: 0, fontSize: 'large' }} type="link" onClick={e => e.preventDefault()}>
                        {`SEQ ID: ${seqIdSelected}`} <DownOutlined />
                    </Button>
                </Dropdown>
                <div>
                    {StringManager.get('claimedResidues') + ': '}
                    <Input style={inputStyle} value={getClaimedResidues(seqIdSelected, claimed).claimedResidues}
                        onChange={(e) => {
                            const newClaimed = claimed.map((residues) => {
                                if(residues.seqId === seqIdSelected) {
                                    return { ...residues, claimedResidues: e.target.value.split(',') };
                                } else {
                                    return residues;
                                }
                            })
                            setClaimed(newClaimed);
                        }} />
                </div>
                <br/>
                {StringManager.get('legalOpinion') + ': '}
                <TextArea value={patentLegalOpinion}
                    onChange={(e) => {
                        setPatentLegalOpinion(e.target.value)
                    }} />
            </div>
        </Modal>
    );
}


export default EditModalDialog;