import React, {Component} from 'react';
import '../Styling/style.css';
export default function SM3(onDeleteAccount) {
    return (
        <div class="sm3">
            <h2 style={{textAlign: 'center', marginBotton: '20px'}}>Delete Account</h2>
        <br/>
    <div>
        <button class="submit danger" onClick={onDeleteAccount}>DELETE ACCOUNT</button>
    </div>
        </div>
    );
}
