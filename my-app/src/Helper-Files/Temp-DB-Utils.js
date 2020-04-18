import React, {Component} from 'react';
import {eventInfo, printSomething, chartData, userData, prevEventData, total_donated, current_donation} from '../Views-Test-Files/Test-Data/Data.js';
import service from './service.js';
/* For copy/paste reference

{ voted, changedInfo, newPaymentInfoSubmitted, newPlanSubmitted, deleteUserAccount, getVoteJSON, getChartData,
    getUserData, getPrevEventData, getTotalDonated, getCurrentDonation, getUserInfo, login, logout
  }
 */


/* f(x)s - DO something */
export const voted = async (on) => {
    // TODO: firebase implement
}
export const changedInfo = async (to) => {
    // TODO: firebase implement
}
export const newPaymentInfoSubmitted = async (token) => {
    console.log(token);
    return 4;
    // TODO: firebase implement
}
export const newPlanSubmitted = async (plan) => {
    // TODO: firebase implement
}
export const deleteUserAccount = async () => {
    // TODO: firebase implement
}
export const login = async (email, pass) => {
    // TODO: firebase implement
    return new Promise((resolve, reject) => {
        // window.history.pushState(null, '', '/home');
        let user = {name: 'John Wick', 'email': 'john@wick.go', uid: '123abc'};
        service.triggerEvent('User', user)
        resolve(user);
    });
}

export const signup = async (name, email, password, phone, plan, payToken) => {
    // TODO: firebase implement
    return new Promise((resolve, reject) => {

        let body = {
            pw: password,
            paymentToken: payToken,
            n: name,
            e: email,
            p: plan,
            z: phone
        }

        console.log(JSON.stringify('Sending Signup POST with body: \n' + body,null,2));

        let user = {name: 'John Wick', 'email': 'john@wick.go', uid: '123abc'};
        service.triggerEvent('User', user)
        resolve(user);
    });
}

export const logout = async () => {
    // TODO: firebase implement
    // window.history.pushState(null, '', '/welcome')
    return new Promise((resolve, reject) => {
        service.triggerEvent('User', null)
        resolve('logged out.');
    });
}
/* f(x)s - GET something */
export async function getVoteJSON() {
    // TODO: firebase retrieval
    let queried_result = {
        section_title: "Sample Section Title",
        section_summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        section_events_info: eventInfo,
        voted_callback: voted
    }
    return {
        title: 'Vote',
        queried_result: queried_result
    };
}

export async function getChartData() {
    // TODO: firebase implement
    return chartData;
}
export async function getUserData() {
    // TODO: firebase implement
    return userData;
}
export async function getPrevEventData() {
    // TODO: firebase implement
    return prevEventData;
}
export async function getTotalDonated() {
    // TODO: firebase implement -> This is done, I think
    return total_donated;
}
export async function getCurrentDonation() {
    // TODO: firebase implement -> This is done, I think
    return current_donation;
}
export async function getUserInfo() {
    // TODO: firebase implement -> This is done, I think
    let info = {name: 'John Wick', 'email': 'john@wick.go'};
    info = null;
    return info;
}
