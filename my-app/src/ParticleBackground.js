import React from 'react';
import Particles from 'react-particles-js';
import * as particle_json from './assets/particle_descr.json';

/*
    Colors:
    Primary: #0E3F81
    Secondary: #5BEAA5
    Tertiary: #3490B9
 */

function addPixels(to, amt) {
    if (to == null) return null;
    let i = to.indexOf('px');
    let pix = parseInt(to.substring(0,i));
    pix += amt;
    return ((pix) + 'px');
}

export default function ParticledContent(content, styles) {

    /* height after 30px padding -> content_box class */
    let padding_constraintd_height = addPixels(styles.height,-40);

    let pinned = {
      position: "relative",
      top: '-'+styles.height,
      left: 0,
      height: styles.height,
    };

    let particle_content = <div style={{backgroundColor: '#e6e6e6'}}><Particles height={styles.height} params={particle_json.default} /></div>;
    return (
        <div>
            {particle_content}
            <div style={pinned} class="pinned">
                <div class="gridded_centered static" style={{height: padding_constraintd_height}}>
                    <div class="content_box">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}

//
// export default function ParticledContent(content, styles) {
//     console.log(JSON.stringify(styles,null,4));
//     let d = <div style={{backgroundColor: 'white'}}><Particles style={styles} height={styles.height} params={particle_json.default} /></div>;
//     return (
//         <div
//           style={styles}
//         >
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: "100%",
//
//               }}
//             >
//               {d}
//               <div
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   width: "100%",
//                   // height: "100%",
//                 }}
//               >
//                   <div
//                     style={{
//                       position: 'static',
//                       width: "80%",
//                       height: "100%",
//                       // margin: '10%',
//                       // boxShadow: '5px 10px black'
//                       border: '2px solid #e8e8e8',
//                       backgroundColor: '#f2f2f2',
//                       padding: '20px',
//                       display: 'grid',
//                       justifyContent: 'center',
//                       justifyItems: 'center',
//                       borderRadius: '10px',
//                       maxWidth: '800px'
//                     }}
//                   >
//                 <div /*style={styles}*/ >
//                     {content}
//                 </div>
//             </div>
//               </div>
//             </div>
//         </div>
//     );
// }
