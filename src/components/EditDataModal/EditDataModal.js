import React, { useState } from 'react';
import { Input, Button } from 'antd';
import Modal from 'react-modal';
import StringManager from '../../utils/StringManager';

function EditModalDialog(props) {
    const [assignee, setAssignee] = useState(props.patentDetails.patentAssignees);
    const [patentName, setPatentName] = useState(props.patentDetails.patentName);
    const [patentFiled, setPatentFiled] = useState(props.patentDetails.patentFiled);
    const [patentDate, setPatentDate] = useState(props.patentDetails.patentDate);
    const [claimed, setClaimed] = useState(props.patentDetails.claimedResidues);
    const [patentLegalOpinion, setPatentLegalOpinion] = useState(props.patentDetails.patentLegalOpinion);

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
        }
    };

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
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            style={customStyles}
        >
            <div>
                <h3 id="contained-modal-title-vcenter">
                    {StringManager.get('editModalTitle') + ' ' + props.patentDetails.patentNumber}
                </h3>
            </div>
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
                <Input value={patentLegalOpinion}
                    onChange={(e) => {
                        setPatentLegalOpinion(e.target.value)
                    }} />
            </div>
            <div>
                <Button onClick={props.onHide}>Close</Button>
                <Button type="primary" onClick={submitPatentDetails}>Submit</Button>
            </div>
        </Modal>
    );
}


export default EditModalDialog;