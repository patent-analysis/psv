import { Component } from 'react';
import { Storage } from 'aws-amplify';
import awsExports from '../.././aws-exports';
import './PatentUpload.css';

class PatentUpload extends Component {
    // Initialize state
    state = {
        imageName: '',
        imageFile: '',
        response: '',
    };

    uploadPatent = () => {
        /* First part of function checks user input to ensure it is not blank
      or include extraneous special characters*/
        var input = document.getElementById('file');
        var proteinName = document.getElementById('protein');
        if (proteinName.value.length <= 1) {
            alert('Please enter or select the Protein name');
            return false;
        }
        if (proteinName.value.match(/\W-_/)) {
            alert('Please do not include special characters');
            return false;
        }
        else {
            /* If the input passes, iterate through all the files the user uploads
      to the S3 bucket in a folder named public and then the protein name the user input
      ex. s3bucket/public/PCSK9/1234.pdf */
            for (var i =0; i < input.files.length; i++) {
                Storage.put(`${document.getElementById('protein').value.toLowerCase()}/${input.files.item(i).name}`,
                    this.upload.files,
                    {
                        bucket: 'psv-document-storage',
                        contentType: input.files.item(i).type,
                        customPrefix: {
                            public: ''
                        }
                    })
                    .then(result => {
                        this.upload = {
                            bucket: awsExports.aws_user_files_s3_bucket,
                            region: awsExports.aws_user_files_s3_bucket_region,
                            key: 'public/' + this.upload.files.name
                        }
                        this.setState({ response: 'Success uploading file!' });
                        alert('Success Uploading File! ');
                        window.location.reload(true);
                    })
                    .catch(err => {
                        this.setState({ response: `Error uploading file: ${err}` });
                    });
            }
        }
    };

    // Function to get the names of all the files the user uploads and display them when called
    readList = () => {
        let input = this.file;
        let output = this.fileList;
        let children = '';
        for (var i =0; i < input.files.length; i++) {
            children += '<li>' + input.files.item(i).name + '<li>';
        }
        output.innerHTML = '<ul style="list-style-type:none;">'+children+'</ul>';
    };

    render() {
        return (
            <div className="App">
                <h2>Please Upload Patents</h2>
                <label className ="proteinLabel" for="proteinLabel">Protein Name: </label>
                <input
                    className="proteinInput"
                    type="text"
                    id="protein"
                    name="protein"
                    required pattern="[0-9a-zA-Z_-]*"
                    list="listProteins"
                />

                {/*List of proteins to be in the drop down */}
                <datalist id = "listProteins">
                    <option value = "PCSK9"></option>
                    <option value = "COVID-19"></option>
                    <option value = "WHEY"></option>
                </datalist>

                <div>
                    {/*Currently accepts images as well as PDFs in the event only images are available */}
                    <input
                        type="file"
                        multiple accept="image/png, image/jpeg, application/pdf"
                        style={{ display: 'none' }}
                        ref={ref => (this.upload = ref)}
                        onChange={e =>
                            this.setState({
                                imageFile: this.upload.files,
                                imageName: this.upload.files.name,
                            })
                        }
                    />

                    {/*Call the readList function to display all the files that have been uploaded by the user */}
                    <input
                        name="file"
                        type="file"
                        id="file"
                        ref={ref => (this.file = ref)}
                        multiple onChange={this.readList}
                    />
                    <label className="toUploadLabel" for="toUploadLabel">Patents to be Upload: </label>
                    <div className="fileList" id="fileList" ref={ref => (this.fileList = ref)}></div>
                </div>
                <button className="uploadButton"onClick={this.uploadPatent}> Upload Files </button>

                {!!this.state.response && <div>{this.state.response}</div>}
            </div>
        );
    }
};
export default PatentUpload;