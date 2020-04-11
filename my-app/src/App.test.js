import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { eventInfo,
     getActiveEventId,
     userVotes,
     userDonations,
     get_all_EventIdAndName_sets,
     castVote,
     getUserInfo,
     mostRecentlyAddedEvent,
     get_n_events,
     get_reciepts_count,
     get_users,
     getTotalDonated,
 } from './Helper-Files/Database.js';

 describe('Event Function Text Suite', () => {

     /* Independent functions */

     test('gets the 5 most recent events', async () => {
       const elist = await get_n_events(5);
       expect(elist).toBeDefined();
       expect(elist.length).toBe(5);
     });
     test('gets the # of reciepts', async () => {
       const n = await get_reciepts_count();
       expect(n).toBeDefined();
     });
     test('gets the # of users', async () => {
       const n = await get_users();
       expect(n).toBeDefined();
     });
     test('gets all event id / name tuples', async () => {
       const tuples = await get_all_EventIdAndName_sets();
       expect(tuples).toBeDefined();
       expect(tuples.length).not.toBe(0);
     });
     test('gets the active event id', async () => {
       eid = await getActiveEventId();
       expect(eid).toBeDefined();
     });

     var eid;

     test('gets the most recently added event\'s id', async () => {
       const id = await mostRecentlyAddedEvent();
       expect(id).toBeDefined();
     });

     /*Event-Dependent */

     let uid = "cATSYis1ldZvRT4L5geR6Q0Vcym1";

     test('gets an event snapshot', async () => {
       const snap = await eventInfo(eid);
       expect(snap).toBeDefined();
     });


     /* User-dependent */

     test('gets a user\'s votes', async () => {
       const snap = await userVotes(uid);
       expect(snap).toBeDefined();
     });

     test('gets a user\'s donations', async () => {
       const snap = await userDonations(uid);
       expect(snap).toBeDefined();
     });

     test('gets a user\'s info', async () => {
       const snap = await getUserInfo(uid);
       expect(snap).toBeDefined();
     });

     test('gets a user\'s total amt donated', async () => {
       const snap = await getTotalDonated(uid);
       expect(snap).toBeDefined();
     });

 });
