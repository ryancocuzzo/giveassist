import React, {Component} from 'react';
import {eventInfo, printSomething, chartData, currEventJSON, userData, prevEventData, total_donated, current_donation} from '../Test-Files/Test-Data/Data.js';
import service from './service.js';
import firebase, { auth, provider } from '../Helper-Files/firebase.js';
import utils from './utils';
import vars, {PLANS} from './variables';
import axios from 'axios';
import Popup from 'react-popup';
import {packaged} from './Error';
/* For copy/paste reference

{ voted, changedInfo, newPaymentInfoSubmitted, newPlanSubmitted, deleteUserAccount, getVoteJSON, getChartData,
    getUserData, getPrevEventData, getTotalDonated, getCurrentDonation, getUserInfo, login, logout
  }
 */


/* f(x)s - DO something */
/* on = index of vote */
export const voted = async (on) => {
    let curr_event = await utils.Event_active().fetch();
    let authtoken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ false);

    let body = {
        params: {
            idToken: authtoken,
            eventId: curr_event,
            voteId: on
        }
    };
    console.log('Casting vote: \n\tEID: ' +body.params.eventId + '\n\tOption: ' + body.params.voteId );
    try {
        let voted = await axios.post(vars.server_urls.castVote, body);
        console.log(voted)
        Popup.alert('Submitted vote');
        return 'Submitted vote!';
    } catch (error) {
        if (error.response) {
            console.log('Issue voting -> ' + error.response.data);
            Popup.alert('Couldn\'t Submit Vote. ' + error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
    }

}
export const changedInfo = async (name, email) => {
    return new Promise( async (res, rej) => {
        let uid = firebase?.auth()?.currentUser?.uid;
        if (!uid) { console.log('Cant get info. No user logged in.'); return; }
        var updated_nam = false;
        // TODO: firebase implement
        if (name) {
            await utils.User_info(uid).setChild('n', name);
            updated_nam =  true;
        }
        if (email) {
            try  {
                console.log('trying -> ' + firebase.auth()?.currentUser?.uid)
                let authdone = await firebase.auth().currentUser.updateEmail(email);
                console.log('authdone')
                let dbdone = await utils.User_info(uid).setChild('e', email);
                console.log('dbdone')
            } catch (e) {
                console.log(e.message)
                rej(updated_nam ? 'Updated name successfully, but not email. ' + e.message : e.message);
            }
        }
        if (name || email) res('Information updated.');
        else res('Information is already updated');
    })
}
export const newPaymentInfoSubmitted = async (paymentToken) => {
    let authtoken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ false);
    return await axios.post(vars.server_urls.changePaymentSource,{tokenId: authtoken, paymentToken: paymentToken  })
}
export const newPlanSubmitted = async (plan) => {
    let authtoken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ false);
    return await axios.post(vars.server_urls.change_plan,{idToken: authtoken, plan: plan  })
}
export const deleteUserAccount = async () => {
    let authtoken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ false);
    await axios.post(vars.server_urls.deleteUser, {idToken: authtoken});
    await logout();
    // TODO: firebase implement
}
export const login = async (email, pass) => {
    let user = await firebase.auth().signInWithEmailAndPassword(email, pass);
    service.triggerEvent('User', user);
    return user;
}

export const userBasicInfo = async () => {
    let uid = firebase?.auth()?.currentUser?.uid;
    if (!uid) { console.log('Cant get info. No user logged in.'); return; }
    let info = await utils.User_info(uid).fetch();
    return { name: info.n, email: info.e };
}

export const signup = async (name, email, password, phone, plan, payToken) => {
    let body = {
        pw: password,
        paymentToken: payToken,
        n: name,
        e: email,
        p: plan,
        z: phone
    }
    try {
        return await axios.post(vars.server_urls.initiate_new_user, {params: { n: body.n, e: body.e,
            p: body.p, z: body.z, pw: body.pw, paymentToken: body.paymentToken }})
    } catch (e) {
        // let msg = re.response.data.message.message;
        console.log('Found signup error' + e?.response?.data?.message?.message || e.toString());
        throw 'Signup Error.';
    }
}

export const logout = async () => {
    // TODO: firebase implement
    await firebase.auth().signOut();
    service.triggerEvent('User', null)
    return 'logged out';
}
/* f(x)s - GET something */
export async function getVoteJSON() {

    let curr_event_id = await utils.Event_active().fetch();
    // console.log(curr_event_id);
    let info = await utils.Event_info(curr_event_id).fetch();
    // console.log(info);
    // if (!info) throw 'no event found!';
    let options = Object.keys(info.o).map((choice, index) => ({title: info.o[choice].t, description: info.o[choice].s, id: index}));
    options.pop();
    console.log(options)
    // TODO: firebase retrieval
    let queried_result = {
        section_title: info.t,
        section_summary: info.s,
        section_events_info: options,
        voted_callback: voted
    }
    return {
        title: 'Vote',
        queried_result: queried_result
    };

}

export async function getChartData() {
    return (await utils.Event_allEvents().limitedFetchChildren(5)).map((event) => ({ title: event.t, total: event.ttl }));
}

export async function getUserData() {
    var ttl_data = await Promise.all(PLANS.map(async plan =>  ({'amount': plan.cost || 'Custom', 'users': await utils.Plan_totalCount(plan.title).promiseBoxedFetch() })));
    console.log(JSON.stringify(ttl_data));
    var sum = 0;
    ttl_data.forEach((row) => sum += row.users);
    let perc_data = ttl_data.map((row) => ({'amount': row.amount, 'percent_users':   round(row.users/sum, 4)}));
    return perc_data;
}
export async function getPrevEventData() {
    let events = await utils.Event_allEvents().limitedFetchChildren(5);
    let reciepts = await Promise.all(events.map(async ({id}) => await utils.Reciept_forEvent(id).fetch()));
    let formatted_event_mapping = events.map((event, index) => (
        { date: event.t, num_users: event.tu, total_rev: event.ttl, receipt: reciepts[index] }
    ))
    return formatted_event_mapping;
}
export async function getTotalDonated() {
    var uid = firebase.auth().currentUser?.uid;
    return utils.User_totalDonated(uid).fetch();
}
export async function getCurrentDonation() {
    var uid = firebase?.auth()?.currentUser?.uid;
    let uinfo = await utils.User_info(uid).fetch();
    let plan_parts = uinfo.p?.split(',');
    return parseFloat(plan_parts ? plan_parts[1] : 0);
}
export async function getUserInfo() {
    return firebase?.auth()?.currentUser;
}

/*  Pesistence helper */
export const establishPersistence = async () => {
    try {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        console.log('Established Local data persistence.')
    } catch (e) {
        console.error('Issue establishing persistence');
    }
}

export const setupFirebaseUserListener = () => {
    firebase.auth().onAuthStateChanged((user) => service.triggerEvent('User', user));
}

/* other */
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

var str = (x) => JSON.stringify(x,null,3);
