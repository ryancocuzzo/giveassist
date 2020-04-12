import React from 'react';
import './Styling/style.css';

function Navbar(title_part1,title_part2, btitle, onclick) {

    return (
        <div class="cnavbar">
            <ul>
                <li class="title"><a><span class="give">{title_part1}</span><span class="assist">{title_part2}</span></a></li>
                <li class="right"><button class="login" onClick={onclick}>{btitle}</button></li>
            </ul>
        </div>
    )
}

export default Navbar;
