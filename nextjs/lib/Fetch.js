import {getCookie} from "./helpers";

const base_url = process.env.NEXT_PUBLIC_GRAPH_QL_API
const axios = require('axios');

export async function fetchQuery(query, variables,cancelToken) {
    console.log('fetch:', typeof fetch);
    console.log('query is called from', typeof window ? 'client' : 'server');
    let extra_headers = {};
    if (typeof window !== 'undefined') {
        extra_headers.Cookie = 'keystone.sid=' + getCookie('keystone.pid');
    }
    /*const result = await lib(base_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...extra_headers,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });*/
    const {data:{data}} = await axios.post(base_url,{query,variables},{
        withCredentials:true,
        headers:extra_headers,
        cancelToken,
    })

    // const json = await result.json()
    //console.log('json:response:', json);
    // const {data} = json;
    return data;
}