import React, {Component} from 'react';
import './Styling/style.css';
import SM1 from './Submodules/SM1.js';
import SM2 from './Submodules/SM2.js';
import SM3 from './Submodules/SM3.js';

let sm1 = SM1("pretext1", 'pretext2');

export default function Mod4 () {
    return (
        <div>
            <SM1/>
            <SM2/>
            <SM3/>
        </div>
    );
}
