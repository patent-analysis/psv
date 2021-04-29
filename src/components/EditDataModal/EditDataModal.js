import React, { useState } from 'react';
import { Input, Modal } from 'antd';
import StringManager from '../../utils/StringManager';
const { TextArea } = Input;

function EditModalDialog(props) {
    const [isModalVisible] = useState(props.isOpen);
    const [assignee, setAssignee] = useState(props.patentDetails.patentAssignees);
    const [patentName, setPatentName] = useState(props.patentDetails.patentName);
    const [patentFiled, setPatentFiled] = useState(props.patentDetails.patentFiled);
    const [patentDate, setPatentDate] = useState(props.patentDetails.patentDate);
    const [claimed, setClaimed] = useState(props.patentDetails.claimedResidues);
    const [patentLegalOpinion, setPatentLegalOpinion] = useState(props.patentDetails.patentLegalOpinion);

    const submitPatentDetails = () => {
        const modifiedPatentDetails = {
            'patentAssignees' : assignee,
            'patentName' : patentName,
            'patentFiled' : patentFiled,
            'patentDate' : patentDate,
            'claimedResidues' : claimed,
            'patentLegalOpinion' : patentLegalOpinion
        }

        props.onPatentEditSubmit(modifiedPatentDetails);
    }

    return (
        <Modal
            title={StringManager.get('editModalTitle') + ' ' + props.patentDetails.patentNumber}
            visible={isModalVisible}
            onOk={submitPatentDetails}
            onCancel={props.onHide}
        >
            <div>
                {StringManager.get('assignee') + ': '}
                <Input value={assignee}
                    onChange={(e) => {
                        setAssignee(e.target.value)
                    }} />
                {StringManager.get('patentName') + ': '}
                <Input value={patentName}
                    onChange={(e) => {
                        setPatentName(e.target.value)
                    }} />
                {StringManager.get('patentFiled') + ': '}
                <Input value={patentFiled}
                    onChange={(e) => {
                        setPatentFiled(e.target.value)
                    }} />
                {StringManager.get('patentDate') + ': '}
                <Input value={patentDate}
                    onChange={(e) => {
                        setPatentDate(e.target.value)
                    }} />
                {StringManager.get('claimedResidues') + ': '}
                <Input value={claimed}
                    onChange={(e) => {
                        setClaimed(e.target.value)
                    }} />
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