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

function addPixels(to, amt) {
    if (to == null) return null;
    let i = to.indexOf('px');
    let pix = parseInt(to.substring(0,i));
    pix += amt;
    return ((pix) + 'px');
}

export default function ParticledContent(content, styles, max_width) {

    if (styles == null || styles.height == null) throw 'Particled Content Error: content styling provided should be non-null & contain a height';

    /* height after 30px padding -> content_box class */
    let padding_constraintd_height = addPixels(styles.height,-40);

    let pinned = {
      position: "relative",
      top: '-'+styles.height,
      left: 0,
      height: styles.height,
    };


    let particle_content = <div style={{backgroundColor: 'white'}}><Particles height={styles.height} params={particle_json.default} /></div>;
    return (
        <div>
            <div style={styles}>
                {particle_content}
                <div style={pinned} class={cssstyles.pinned}>
                    <div class={cssstyles.gridded_centered } style={{height: padding_constraintd_height}}>
                        <div class={cssstyles.content_box} style={{maxWidth: max_width, width: styles.width}}>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SpecificParticledContent(content, styles) {

    if (styles == null || styles.height == null) throw 'Particled Content Error: content styling provided should be non-null & contain a height';

    /* height after 30px padding -> content_box class */
    let padding_constraintd_height = addPixels(styles.height,-40);

    let pinned = {
      position: "relative",
      top: '-'+addPixels(styles.height,-styles.paddingTop),
      left: 0,
      height: styles.height,
    };

    styles.paddingTop = '0px';

    if (styles.color) {
        particle_json.default.particles.color = styles.color;
        particle_json.default.particles.shape.stroke = styles.color;
        particle_json.default.particles.line_linked.stroke = styles.color;
    }
    let particle_content = <div style={{backgroundColor: styles.backgroundColor}}><Particles height={styles.height} params={particle_json.default} /></div>;
    return (
        <div>
            <div style={styles}>
                {particle_content}
                <div style={pinned} class={cssstyles.pinned}>
                    <div class={cssstyles.gridded_centered } style={{height: padding_constraintd_height}}>
                        <div class={cssstyles.content_box} style={{maxWidth: styles.maxWidth, width: styles.width}}>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
