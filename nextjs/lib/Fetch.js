import {getCookie} from "./helpers";

const base_url = process.env.NEXT_PUBLIC_GRAPH_QL_API
const axios = require('axios');

export async function fetchQuery(query, variables,cancelToken) {
    let extra_headers = {};
    if (typeof window !== 'undefined') {
        extra_headers.Cookie = 'keystone.sid=' + getCookie('keystone.pid');
    }

    const {data:{data,errors}} = await axios.post(base_url,{query,variables},{
        withCredentials:true,
        headers:extra_headers,
        cancelToken,
    })

    if (errors && errors.length > 0) {
        console.error(errors);
        throw new Error('Something went wrong.')
    }

    return data;
}