/** @jsx jsx */

import { jsx } from '@emotion/core';
export default function StarsCell({ field, data }) {
    let length = null
    try {
        length = JSON.parse(data).length
    } catch (e) {

    }
    return <div>
        {length && <p>{length} Lines</p>}
    </div>;
}