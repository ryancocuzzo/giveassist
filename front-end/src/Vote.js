
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
import Popup from 'react-popup';
import axios from 'axios';
import { Col, Row, Grid, DropdownButton, Button} from 'react-bootstrap';
import firebase, { auth, provider } from './firebase.js';
import {eventSnapshot, userVotes, getActiveEventId, votersFor, createEvent, getOptions, genKey, castVote} from './Database.js';
import vars from './variables.js';

var server_urls = vars.server_urls;
/**
 * Constructs the stats page.. doesn't do too much tbh except I guess dynamically render a couple things.
 * @extends React
 */
class Vote extends React.Component {

  /**
   * Constructs stats obj
   * @param {[JSON Object]} props [need events!!]
   */
  constructor(props) {
    super(props);

    var user = firebase.auth().currentUser;


    // Init state
    this.state = {
      user: user,
      event: null,
      token: null,
      canCreateEvents: false,
      hasVoted: false,
      votes: []
    }

    // Bind components
    this.eventComponent = this.eventComponent.bind(this);
    this.click = this.click.bind(this);


  }

  createEventComponent = () => {
    return (
      <div>
        <button style={{marginLeft: '20px'}} onClick={() => this.createEvent()}>Create Event</button>
      </div>
    );
  }


  /**
   * When the component mounts..
   */
  componentDidMount() {

    if (this.state.user) {

      firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {

        // Handle tokens

        this.setState({token: idToken});

        if (idToken) {
          axios.get(server_urls.eventPriviledges, {params: {idToken: idToken}}).then( function(response) {
            let canCreateEvents = response.data;
            this.setState({canCreateEvents:canCreateEvents});
          }.bind(this))
        }

        // Handle whether or not the user has voted

        userVotes(this.state.user.uid).then(function(votes) {
          console.log(votes);
          this.setState({votes: votes});
        }.bind(this))


      }.bind(this)).catch(function(error) {
        // Handle error
      }.bind(this));
    }

    // Check for new user (state change)
    firebase.auth().onAuthStateChanged(function(user) {
        this.setState({user: user});
        if (user) {
          firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {

            this.setState({token: idToken});

            if (idToken) {
              axios.get(server_urls.eventPriviledges, {params: {idToken: idToken}}).then( function(response) {
                let canCreateEvents = response.data;
                this.setState({canCreateEvents:canCreateEvents});
              }.bind(this))
            } else {
              this.setState({canCreateEvents:false});
            }
          }.bind(this)).catch(function(error) {
            // Handle error
          });
        }

    }.bind(this));

    getActiveEventId().then(function(eventId) {
      eventSnapshot(eventId).then(function(event) {
        console.log(event);
        var e = {
          title: event["title"],
          summary: event["summary"],
          options: event["options"],
          id: event['id']
        }
        this.setState({
          event: e
        })
      }.bind(this))
    }.bind(this));


  }


  hasVotedCheck = () => {
    var hasVoted = this.state.hasVoted;
    var checkVoted = false;
    if (this.state.event) {

      let current_event = this.state.event.id;
      let votes = this.state.votes;
      // console.log('checking' + votes + ' for ' + current_event);
      votes.forEach(function(event) {
        // console.log('checkingg' + event + ' for ' + current_event);
        if (event == current_event) {
          checkVoted = true;
        }
      })
    }
    if (hasVoted != checkVoted)
      this.setState({hasVoted: checkVoted});
    return checkVoted;
  }

  /**
   * Click function for when a user selects their choice
   * @param  {[int]} id [id of the event the user is selecting]
   */
  click = (optionId) => {
    if (optionId != null) {
      console.log(this.state.event)
      let eventId = this.state.event.id;
      let uid = firebase.auth().currentUser.uid;
      // console.log(optionId, eventId, uid)
      console.log(eventId)
      console.log(optionId)
      console.log(uid)

      castVote(eventId, optionId, uid);
    }
  }

  /**
   * Draws an event component (dynamically generated)
   * @param  {[String]} name    [name of the event]
   * @param  {[String]} summary [summary of event]
   * @return {[Object]}         [react element of an event]
   */
  eventComponent = (name, summary, id) => {
    if (name != null && summary != null) {
      return (<Col sm={12} md={12} lg={12}>
        <div className="eventComponent" style={{padding: '10px', backgroundColor: 'lightGrey', textAlign: 'center', borderRadius: '7px', fontSize: '12px'}}>
          <h1 style={{display: 'inline-block'}}>{name}</h1>
          <br></br>
          <p>{summary}</p>
        <button onClick={() => this.click(id)}>Here is a button!</button>
        </div>
      </Col>);
    } else {
      return (
        <div>
          <br></br>
          <h3 style={{fontColor: 'darkGrey'}}> Attempting to draw component with invalid stuff.</h3>
          <br></br>
        </div>);
    }

  }

  createEvent = () => {
    var token = this.state.token;
    var titles = ['peace', 'love', 'dev'];
    var summaries = ['Summary 1', 'Summary 2', 'Summary 3'];
    var options = getOptions(titles, summaries);
    var eventTitle = 'Week X'
    var eventSummary = 'Time to donate!';
    createEvent(eventTitle, eventSummary, options, token);
  }

  /**
   * render stuff
   * @return {[Object]} [rendered stats page]
   */
  render() {

    console.log("rendering with votes " + this.state.votes + " and event " + (this.state.event ? this.state.event.id : 'TBD'));

    var event = this.state.event

    var objArray = [];
    if (event) {

        Object.keys(event.options).forEach(function(key) {
          var temp = {}

          temp[key] = event.options[key];

          objArray.push(temp);
      });
    }
      var eventMap;

    if (event) {
      eventMap = objArray.map(function(event) {
        console.log('E:' + JSON.stringify(event))
        var firstProp;
        var k;
        for(var key in event) {
            if(event.hasOwnProperty(key)) {
                firstProp = event[key];
                k = key;
                break;
            }
        }
        return this.eventComponent(firstProp.title, firstProp.summary, k);
      }.bind(this))
    } else {
      eventMap = <p>No events found!</p>;
    }

    console.log(this.hasVotedCheck());

    var createEventComponent_local = (this.state.canCreateEvents == true) ? this.createEventComponent() : (<div></div>);

    var hasVotedComponent = (
      <div style={{textAlign: 'center'}}><h4 style={{marginLeft: '20px', display: 'inline-block'}}>You've already voted for this event!</h4></div>
    )
    // Generaet a default HTML object that we are gonna append to
    var eventComponent = (
      <div>
        <span>
          <h1 style={{marginLeft: '20px'}}>{event ? ("EVENT: " + event.title) : "Cannot find event!"}
          </h1>
          <p style={{marginLeft: '20px'}}>
            {event ? (event.summary) : ""}
          </p>
          {createEventComponent_local}
          <br /><br />
          {this.hasVotedCheck() ? hasVotedComponent : eventMap}

        </span>
      </div>
    );

    return eventComponent;
  }

}

export default Vote;
