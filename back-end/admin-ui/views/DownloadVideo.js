/** @jsx jsx */
import {jsx} from '@emotion/core';
import {useMutation, useQuery, gql} from '@apollo/client';
import {Input} from '@arch-ui/input'
import {LoadingButton} from '@arch-ui/button'
import {useState} from 'react';
import { useHistory } from "react-router-dom";

const DownloadLink = () => {
    const [url, setUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [loading,setLoading] = useState(false);
    const history = useHistory();

    const MUTATION = gql`
        mutation($url: String!, $fileName: String!){
          downloadVideo(url: $url,fileName: $fileName){
            id
          }
        }`;

    const [downloadVideoMutation,{called,loading:mutationLoading}] = useMutation(MUTATION, {
        onCompleted: async () => {
            console.log('onComplete');
        },
    });


    async function downloadVideo() {
        setLoading(true);
        const serverResponse = await downloadVideoMutation({
            variables: {
                url, fileName
            }
        });
        setLoading(false);
        const id = serverResponse.data.downloadVideo.id;
        history.push('/admin/sounds/'+id);
        console.log("server Response", id);
    }

    return <div>
        <h4 style={{margin: '1rem 0'}}>Import Sound from Video by URL</h4>
        <br/>
        <div>
            <label>URL</label>
            <Input
                disabled={loading}
                value={url} placeholder="Enter URL"
                   type="url"
                   onChange={(e) => setUrl(e.target.value)}/>
            <br/>
            <br/>
            <label>FileName</label>
            <Input
                disabled={loading}
                value={fileName} placeholder="Enter Sound Name"
                   onChange={(e) => setFileName(e.target.value)}/>

             <LoadingButton
                 disabled={loading}
                 style={{marginTop:'1rem'}}
                 appearance="primary"
                 isLoading={loading}
                 onClick={downloadVideo}
                 indicatorVariant="dots"
             >Submit</LoadingButton>
        </div>

    </div>
}

export default DownloadLink;