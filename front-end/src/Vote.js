
import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
// import './App.css';
import Popup from 'react-popup';
import axios from 'axios';
import { Col, Row, Grid, DropdownButton, Button} from 'react-bootstrap';
import firebase, { auth, provider } from './firebase.js';
import {eventSnapshot, userVotes, getActiveEventId, votersFor, totalVotesFor, createEvent, getOptions, genKey, castVote} from './Database.js';
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
      hasVoted: 'IDK',
      something: false,
      votes: [],
      eventComponentWidth: 12,
      dispersion: [],
      total_votes: 0,
      width: document.body.clientWidth
    }

    // Bind components
    this.eventComponent = this.eventComponent.bind(this);
    this.click = this.click.bind(this);

    window.history.pushState(null, '', '/vote')


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

        var size = Object.keys(e.options).length

        var total = 0;

         var dispersionArray = [];
         if (event) {

             Object.keys(e.options).forEach(function(key) {
               var opt = {
                   id: key,
                   title: e.options[key].title,
                   votes: e.options[key].total_votes
               };
               total += opt.votes;
                dispersionArray.push(opt);
             });
         }

         this.setState({
           event: e,
           eventComponentWidth: 12 / size,
           dispersion: dispersionArray,
           total_votes: total
         });

      }.bind(this))
    }.bind(this));

    window.addEventListener("resize", function(event) {
      console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
      this.setState({width: document.body.clientWidth});
    }.bind(this))

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
    if (this.state.something != null && this.state.something == true)
      checkVoted = true;
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
      this.setState({ hasVoted: true });
      this.setState({ something: true});
      Popup.alert('Your vote has been recieved.\nThanks for voting on this event!')
      console.log('hasVoted now true!')
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
      var size = this.state.eventComponentWidth;
      return (<Col sm={size} md={size} lg={size}>
        <div className="eventComponent" style={{padding: '10px', backgroundColor: '#A9DBEF', boxShadow: '0 7px 14px rgba(50, 50, 93, .10), 0 3px 6px rgba(0, 0, 0, .08)', marginBottom: '20px', textAlign: 'center', borderRadius: '7px', fontSize: '12px', }}>
          <h1 style={{display: 'inline-block', fontWeight: '500'}}>{name}</h1>
          <br></br>
          <p>{summary}</p>
        <button onClick={() => this.click(id)}>VOTE</button>
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

    var fontSize = '20px';
    var col_width_wide = '150px';
    var bottomMargin = '400px'

    if (this.state.width < 700) {
      fontSize = '17px';
      col_width_wide = '100px';
      bottomMargin = '200px';
    }
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
      eventMap = <p></p>;
    }

    var hasVotedComponent = (
      <div style={{textAlign: 'center'}}><h4 style={{marginLeft: '20px', display: 'inline-block'}}>You've already voted for this event!</h4></div>
    )

    var dynamic_vote_component;
    if (this.state.hasVoted != 'IDK') {
      if (this.hasVotedCheck()) {
        dynamic_vote_component = hasVotedComponent;
      } else {
        dynamic_vote_component = eventMap;
      }
    } else {
      dynamic_vote_component = <div></div>
      this.hasVotedCheck();
    }

    var size = this.state.eventComponentWidth;
    var total_votes = this.state.total_votes;

    var colorForVoteCount = (count) => {
      if (total_votes != 0) {
        let percentage = count *1.0 / total_votes;
        var numOptions = 12/size;
        let average = 1.0 / numOptions;
        let stdDev = 0.08;
        // alert(percentage)
        if (percentage > average + stdDev) { // Dark green
          return '#3cbc0d';
        } else if (percentage > average) {
          return '#b7e88f'
        } else if (percentage == average) {
          return '#bfe02c';
      }  else if (percentage >= (average-stdDev)) {
          return '#f9c159';
        } else {
          return '#f46353'
        }
      } else {
        return 'black'
      }
    }

    var size = this.state.eventComponentWidth;
    var total_votes = this.state.total_votes;

    var percentageCalc = (count) => {
      if (total_votes != 0) {
        var p = (count *1.0 / total_votes);
        p = Math.round(p * 100) / 100;
        if (p == 1) return '100%';
        else return (p + '%');
      } else {
        return '';
      }
    }

    var dispersedComponent = this.state.dispersion.map(function(element, i) {
        return <Col sm={size} md={size} style={{textAlign: 'center'}}>
          <h1 style={{display: 'inline-block', fontSize: '50px', fontWeight: 'bold', color: 'black'}}>{element.title}</h1>
        <br />
      <h1 style={{display: 'inline-block', fontSize: '60px', fontWeight: '900', color: colorForVoteCount(element.votes)}}>{percentageCalc(element.votes)}</h1>
      </Col>;
      })

    if (this.state.hasVoted != true ) {
      dispersedComponent = <div></div>;
    };


    var createEventComponent_local = (this.state.canCreateEvents == true) ? this.createEventComponent() : (<div></div>);


    // Generaet a default HTML object that we are gonna append to
    var eventComponent = (
      <div className='myGradientBackground'>
        <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>
        <span>
          <h1 style={{marginLeft: '20px', fontWeight: '500'}}>{event ? ("EVENT: " + event.title) : ""}
          </h1>
          <p style={{marginLeft: '20px'}}>
            {event ? (event.summary) : ""}
          </p>
          {createEventComponent_local}
          <br /><br />
        {dynamic_vote_component}
        </span>
        {dispersedComponent}
        <br/>
        <br/>
        <br/>
        <br/>
      <div style={{width: '100%', height: bottomMargin}}></div>
      </div>
    );

    return eventComponent;
  }

}

export default Vote;
