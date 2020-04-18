import React from 'react';
import Particles from 'react-particles-js';
import * as particle_json from './particle_descr.json';
import cssstyles from './Styles/styles.module.css';
/*
    Colors:
    Primary: var(--primary)
    Secondary: var(--secondary)
    Tertiary: var(--tertiary)
 */

 function valid_check(x) {
   return x !== null && x !== undefined && x !== false;
 }
 /* params - styles: { max_width, min_width }, params: { vertCenter, horCenter } */
 export default function PerfParticledContent(content, styles, params) {
   // alert('hi')
   if (styles == null || styles.height == null)
     throw "Particled Content Error: content styling provided should be non-null & contain a height";

   if (params == null) throw 'Particled Content Error: You should have params defining centering values';
   /* height after 30px padding -> content_box class */
   let padding_constraintd_height = styles.height;

   let pinned = {
     position: "relative",
     top: "-" + styles.height,
     left: 0,
     height: styles.height,
     padding: "0px",
   };

   if (styles.color) {
     particle_json.default.particles.color = styles.color;
     particle_json.default.particles.shape.stroke = styles.color;
     particle_json.default.particles.line_linked.stroke = styles.color;
   }
   let particle = <Particles height={styles.height} params={particle_json.default} />;
   // let particle = (
   //   <div
   //     style={{ height: styles.height, backgroundColor: "red", width: "100%" }}
   //   />
   // );
   //

   if (window.innerWidth < 550) particle_json.default.particles.number.value = 12;

   let particle_content = (
     <div style={{ backgroundColor: styles.backgroundColor }}>{particle}</div>
   );
   console.log("returning component with a min  width of " + styles.minWidth);
   let vcentered = params && valid_check(params.vertCenter);
   let hcentered = params && valid_check(params.horCenter);
   let view_h_centered = params && valid_check(params.centered);
   // alert(vcentered + " " + hcentered + " " + view_h_centered);

   if (params.particleMargin) styles.padding = params.particleMargin;

   return (
     <div>
       <div style={styles} class={view_h_centered ? cssstyles.grd : ""}>
         {particle_content}
         <div style={pinned} class={cssstyles.pinned}>
           <div
             class={cssstyles.gridded_centered}
             style={{
               height: padding_constraintd_height,
               minWidth: styles.minWidth,
               maxWidth: styles.maxWidth,
               alignContent: vcentered ? "center" : null,
               justifyContent: hcentered ? "center" : "left"
             }}
           >
             <div
               class={cssstyles.content_box}
               style={{
                 maxWidth: params.content_max_width,
                 minWidth: styles.min_width,
               }}
             >
               {content}
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }
//
// function addPixels(to, amt) {
//     if (to == null) return null;
//     let i = to.indexOf('px');
//     let pix = parseInt(to.substring(0,i));
//     pix += amt;
//     return ((pix) + 'px');
// }
//
// export default function ParticledContent(content, styles, max_width, min_width) {
//
//     if (styles == null || styles.height == null) throw 'Particled Content Error: content styling provided should be non-null & contain a height';
//
//     /* height after 30px padding -> content_box class */
//     let padding_constraintd_height = addPixels(styles.height,-40);
//
//     let pinned = {
//       position: "relative",
//       top: '-'+styles.height,
//       left: 0,
//       height: styles.height,
//     };
//
//
//     let particle_content = <div style={{backgroundColor: 'white'}}><Particles height={styles.height} params={particle_json.default} /></div>;
//     console.log('returning component with a min  width of ' + styles.minWidth);
//
//     return (
//         <div>
//             <div style={styles}>
//                 {particle_content}
//                 <div style={pinned} class={cssstyles.pinned}>
//                     <div class={cssstyles.gridded_centered } style={{height: padding_constraintd_height, minWidth: styles.minWidth, maxWidth: styles.maxWidth}}>
//                         <div class={cssstyles.content_box} style={{maxWidth: styles.max_width, minWidth: styles.min_width}}>
//                             {content}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
// /* params - styles: { max_width, min_width }, params: { vertCenter, horCenter } */
// export function PerfParticledContent(content, styles, params) {
//     // alert('hi')
//     if (styles == null || styles.height == null) throw 'Particled Content Error: content styling provided should be non-null & contain a height';
//
//     /* height after 30px padding -> content_box class */
//     let padding_constraintd_height = addPixels(styles.height,-40);
//
//     let pinned = {
//       position: "relative",
//       top: '-'+styles.height,
//       left: 0,
//       height: styles.height,
//     };
//
//
//         if (styles.color) {
//             particle_json.default.particles.color = styles.color;
//             particle_json.default.particles.shape.stroke = styles.color;
//             particle_json.default.particles.line_linked.stroke = styles.color;
//         }
//     let particle_content = <div style={{backgroundColor: styles.backgroundColor}}><Particles height={styles.height} params={particle_json.default} /></div>;
//     console.log('returning component with a min  width of ' + styles.minWidth);
//     alert(JSON.stringify(params))
//     return (
//         <div>
//             <div style={styles}>
//                 {particle_content}
//                 <div style={pinned} class={cssstyles.pinned}>
//                     <div class={cssstyles.gridded_centered } style={{height: padding_constraintd_height, minWidth: styles.minWidth, maxWidth: styles.maxWidth, alignContent: params && params.horCenter ? 'center' : null, justifyContent: params && params.vertCenter ? 'center' : null}}>
//                         <div class={cssstyles.content_box} style={{maxWidth: styles.max_width, minWidth: styles.min_width}}>
//                             {content}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
//
//
//
// export function SpecificParticledContent(content, styles, params) {
//
//     if (styles == null || styles.height == null) throw 'Particled Content Error: content styling provided should be non-null & contain a height';
//
//     /* height after 30px padding -> content_box class */
//     let padding_constraintd_height = addPixels(styles.height,-40);
//
//     let pinned = {
//       position: "relative",
//       top: '-'+addPixels(styles.height,-styles.paddingTop),
//       left: 0,
//       height: styles.height,
//     };
//
//     styles.paddingTop = '0px';
//
//     if (styles.color) {
//         particle_json.default.particles.color = styles.color;
//         particle_json.default.particles.shape.stroke = styles.color;
//         particle_json.default.particles.line_linked.stroke = styles.color;
//     }
//     let particle_content = <div style={{backgroundColor: styles.backgroundColor}}><Particles height={styles.height} params={particle_json.default} /></div>;
//     return (
//         <div>
//             <div style={styles}>
//                 {particle_content}
//                 <div style={pinned} class={cssstyles.pinned}>
//                     <div class={cssstyles.gridded_centered } style={{height: padding_constraintd_height, justifyItems: params && params.align ? params.align : 'center'}}>
//                         <div class={cssstyles.content_box} style={{maxWidth: styles.maxWidth, minWidth: styles.minWidth, width: styles.width}}>
//                             {content}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
