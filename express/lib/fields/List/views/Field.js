/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FieldContainer, FieldLabel, FieldInput ,} from '@arch-ui/fields';
import {useState} from 'react';
import {IconButton} from '@arch-ui/button'
import {ChevronDownIcon,ChevronUpIcon } from "@primer/octicons-react"
import './field.css'

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function formatDate(mills) {
    const seconds = +parseFloat(mills / 1000).toFixed(0);
    const minutes = +parseFloat(seconds / 60).toFixed(0);
    const hours = +parseFloat(minutes / 60).toFixed(0);
    let d = pad(hours,2) + ':' + pad(minutes % 60 ,2) + ":" + pad(seconds % 60,2) /*+ ':' + pad(it.getMilliseconds(),3);*/
    return d;
}

const StarsField = ({ field, value, errors, onChange }) => {
    if (!value) {
        return '';
    }
    let list = null;
    try {
        if (value) list = JSON.parse(value);
    } catch (e) {
        console.error(e)
    }
    const [expanded,setExpanded]  = useState(false);
    return (
        <FieldContainer>
            <FieldLabel htmlFor={`ks-input-${field.path}`} field={field} errors={errors}/>
            <div style={{}}>
                {list && <IconButton icon={expanded? ChevronUpIcon : ChevronDownIcon} variant="ghost"  onClick={()=>setExpanded(!expanded)}>
                    {list.length + ' lines'}
                </IconButton>}
            </div>

            <div className={'sub-list ' + (expanded ? 'expanded' : '')}>
                {list.map((it,i) => (<div className="sub-item" key={i}>
                    <div className="time">
                        <div>
                            {formatDate(it.start)}
                        </div>
                        <div>
                            {"  -  " }
                        </div>
                        <div>
                            {formatDate(it.end)}
                        </div>
                    </div>
                    <div className="text">
                        {it.text}
                    </div>
                </div>))}
            </div>
        </FieldContainer>
    );
}
export default StarsField;