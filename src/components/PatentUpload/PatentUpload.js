import StringManager from '../../utils/StringManager';
import Storage from "@aws-amplify/storage";
import { Component } from 'react';
import { Form, Input } from 'antd';
import './PatentUpload.css';

class PatentUpload extends Component {

    // Set initial state to null
    state = {
        proteinName: "",
        fileName: "",
        pdfFile: "",
        response: ""
      };
    
    // Call Storage function to store in S3 bucket
    // respond if success or failure
    uploadFile = () => {
    // TODO: S3 Bucket config SetS3Config("", "protected");
    Storage.put(`${this.upload.value[0]}/${this.upload.files[0].name}`,
            this.upload.files[0],
            { contentType: this.upload.files[0].type })
        .then(result => {
        this.upload = null;
        this.setState({ response: "Success uploading file!" });
        })
        .catch(err => {
        this.setState({ response: `Cannot upload file: ${err}` });
        });
      };
    

    // Save file name and file in an array
    render() {
        return (
            <div className="App">
            <h2>Upload Patents</h2>
            <Form
                name="basic"
                className="protein-container"
                initialValues={{ remember: true }}
                onChange={e =>
                    this.setState({
                        proteinName: this.upload.value[0]
                    })
                }
            >
                <Form.Item
                    className="protein-container_input"
                    label={StringManager.get('typeProtein')}
                    name="protein"
                    rules={[{ required: false }]}
                >
                    <Input />
                </Form.Item>
            </Form>
            <input
                className="upload-container"
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                style={{ display: "none" }}
                ref={ref => (this.upload = ref)}
                onChange={e =>
                this.setState({
                    pdfFile: this.upload.files[0],
                    fileName: this.upload.files[0].name
                })
                }
            />
            <input
            className="upload-container_input" 
            value={this.state.fileName} placeholder="Select file" 
            />
            <button
                className="fileButton"
                onClick={e => {
                this.upload.value = null;
                this.upload.click();
                }}
                loading={this.state.uploading}
            >
                Browse
            </button>
            <div>
            <button 
            className="uploadButton"
            onClick={this.uploadFile}> Upload File 
            </button>
            </div>
            {!!this.state.response && <div>{this.state.response}</div>}
            </div>
        );
    }
}
export default PatentUpload;