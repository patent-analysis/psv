import React, { useState } from 'react';
import { Input, Button } from 'antd';
import Modal from 'react-modal';

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
        props.patentDetails.patentAssignees = assignee;
        props.patentDetails.patentName = patentName;
        props.patentDetails.patentFiled = patentFiled;
        props.patentDetails.patentDate = patentDate;
        props.patentDetails.claimedResidues = claimed;
        props.patentDetails.patentLegalOpinion = patentLegalOpinion;

        props.onPatentEditSubmit();
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
                    Edit Patent Data: {props.patentDetails.patentNumber}
                </h3>
            </div>
            <div>
                Assignee:
                <Input value={assignee}
                    onChange={(e) => {
                        setAssignee(e.target.value)
                    }} />
                Patent Name:
                <Input value={patentName}
                    onChange={(e) => {
                        setPatentName(e.target.value)
                    }} />
                Patent Filed:
                <Input value={patentFiled}
                    onChange={(e) => {
                        setPatentFiled(e.target.value)
                    }} />
                Patent Date:
                <Input value={patentDate}
                    onChange={(e) => {
                        setPatentDate(e.target.value)
                    }} />
                Claimed:
                <Input value={claimed}
                    onChange={(e) => {
                        setClaimed(e.target.value)
                    }} />
                Legal Opinion:
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