import {Storage, AffixProps, graphqlOperation } from 'antd';
import StringManager from '../../utils/StringManager';

const PatentUpload = () => {

    //addFiletoDB to do when approved

    onChange(e) {
        const file = e.target.files[0];
        console.log(file);

        Storage.put(file.name, file, {
            contentType: 'text/plain'
        }).then ((result)) => {
            this.setState({file: URL.createObjectURL(file)})

            const file = {
                name: file.name,
                // file: {
                    //not yet approved on Github
                    // bucket: 
                    // region:
                    // key:
                // }
            }
        }
    };

    <div>Patent Upload Page</div>
        return (
            <div className = "uploadFile">
                <div>
                    <p>Please upload patents</p>
                    <input type = "file" onChange = {(e) => this.onChange(e)}/>
                </div>
            </div>
        )
};
export default PatentUpload;