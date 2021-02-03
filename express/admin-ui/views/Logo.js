/** @jsx jsx */
import { jsx } from '@emotion/core';

const Logo =  () => {
    return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <img src="https://img.icons8.com/ultraviolet/96/000000/cool.png"/>
            <h4>Awesome CMS</h4>
        </div>
    )
}

export default Logo;