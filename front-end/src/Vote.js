
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

          getActiveEventId().then(function(eventId) {
            eventSnapshot(eventId).then(function(event) {
              if (!event) {
                  return;
              }
              console.log('E: ' + JSON.stringify(event));
              var e = {
                title: event["t"],
                summary: event["s"],
                options: event["o"],
                id: event['id']
              }

              var size = Object.keys(e.options).length -1;

              var total = 0;

               var dispersionArray = [];
               if (event) {

                   Object.keys(e.options).forEach(function(key) {
                     if (e.options[key].t != null) {
                       var opt = {
                           id: key,
                           title: e.options[key].t,
                           votes: e.options[key].ttl
                       }
                       total += opt.votes;
                        dispersionArray.push(opt);
                     }

                   });
               }

               this.setState({
                 event: e,
                 eventComponentWidth: 12 / size,
                 dispersion: dispersionArray,
                 total_votes: total
               });

               this.userHasAlreadyVoted(e.id, user.uid);

            }.bind(this))
          }.bind(this));


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



    window.addEventListener("resize", function(event) {
      console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
      this.setState({width: document.body.clientWidth});
    }.bind(this))

  }

   userHasAlreadyVoted = async (eventId, userId) => {
        try {
            let event_ref = firebase.database().ref('/users/' + userId + '/v/' + eventId + '/c');
            event_ref.once('value').then(function(snapshot, err) {
                if (err) { this.setState({hasVoted: false}) }
                if (snapshot && snapshot.val()) {
                    this.setState({hasVoted: true})
                } else {
                    this.setState({hasVoted: false})
                }
            }.bind(this));

        } catch (e) {

            this.setState({hasVoted: false})
        }
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
  }

  /**
   * Click function for when a user selects their choice
   * @param  {[int]} id [id of the event the user is selecting]
   */
  click = (optionId, i) => {
    if (optionId != null && this.state.token != null) {

      let eventId = this.state.event.id;
      let tkn = this.state.token;

      castVote(eventId, optionId, tkn);

      this.state.dispersion[i].votes = this.state.dispersion[i].votes + 1;
      this.state.total_votes = this.state.total_votes + 1;
      this.setState({
         hasVoted: true,
         something: true,

        });

      Popup.alert('Your vote has been recieved.\nThanks for voting on this event!')
    }
  }

  /**
   * Draws an event component (dynamically generated)
   * @param  {[String]} name    [name of the event]
   * @param  {[String]} summary [summary of event]
   * @return {[Object]}         [react element of an event]
   */
  eventComponent = (name, summary, id, i) => {
    var s = (size) => {
      if (size < 600) return '700px'
      else if (size < 770) return '580px'
      else if (size < 850) return '680px'
      else if (size < 1000) return '600px'
      else if (size < 1300) return '550px'
      else return '450px'
    }
    var h = s(this.state.width)
    if (name != null && summary != null) {
      var size = this.state.eventComponentWidth;
      return (<Col sm={size} md={size} lg={size}>
        <div className="eventComponent" style={{padding: '10px', height: h, backgroundColor: '#D4F5F5', boxShadow: '0 7px 14px rgba(50, 50, 93, .10), 0 3px 6px rgba(0, 0, 0, .08)', marginBottom: '20px', textAlign: 'center', borderRadius: '7px', fontSize: '12px', }}>
          <h1 style={{display: 'inline-block', fontWeight: '700'}}>{name}</h1>
          <br></br>
          <p style={{fontSize: '15px', 'letter-spacing': '1px', fontWeight: '550'}}>{summary}</p>
      <div style={{position: 'absolute',
                  bottom: '0',
                  marginTop: '-30px',
                  marginLeft: '-25px',
                  marginBottom: '40px',
                  width: '100%',
                  height: '-140px',}}>
                  <button onClick={() => this.click(id, i)}>VOTE</button>
      </div>
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
    var bottomMargin = '600px'

    if (this.state.width < 700) {
      fontSize = '17px';
      col_width_wide = '100px';
      bottomMargin = '200px';
    }
    var event = this.state.event

    var objArray = [];
    if (event) {

        Object.keys(event.options).forEach(function(key) {
          if (event.options[key].t) {
            var temp = {}

            temp[key] = event.options[key];

            objArray.push(temp);
          }
      });
    }
      var eventMap;

    if (event) {
      eventMap = objArray.map(function(event, i) {
        var firstProp;
        var k;
        for(var key in event) {
            if(event.hasOwnProperty(key)) {
                firstProp = event[key];
                k = key;
                break;
            }
        }
        return this.eventComponent(firstProp.t, firstProp.s, k, i);
      }.bind(this))
    } else {
      eventMap = <p></p>;
    }

    var hasVotedComponent = (
      <div style={{textAlign: 'center'}}><h3 style={{marginLeft: '20px', display: 'inline-block', fontWeight: '600'}}>You've already voted for this event!</h3></div>
    )

    var dynamic_vote_component;
    if (this.state.hasVoted != 'IDK') {
      if (this.state.hasVoted) {
        dynamic_vote_component = hasVotedComponent;
      } else {
        dynamic_vote_component = eventMap;
      }
    } else {
      dynamic_vote_component = <div></div>
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

    function roundToTwo(num) {
        return +(Math.round(num + "e+2")  + "e-2");
    }

    var size = this.state.eventComponentWidth;
    var total_votes = this.state.total_votes;

    var percentageCalc = (count) => {
      // alert('Received: ' + count);
      if (total_votes != 0) {
        var p = (count *1.0 / total_votes);
        p = roundToTwo(p);
        p = Math.round(p * 100);
        p = Math.round(p) /Math.round(100);
        p = Math.round(p * 100);
        // alert(p);
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

    // alert(this.state.hasVoted)
    if (!this.state.hasVoted) {
      dispersedComponent = <div></div>;
    } else {
      eventMap = <div></div>;
    };

    var createEventComponent_local = (this.state.canCreateEvents == true) ? this.createEventComponent() : (<div></div>);


    // Generaet a default HTML object that we are gonna append to
    var eventComponent = (
      <div className='myGradientBackground'>
        <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>
        <span>
          <h1 style={{marginLeft: '20px', fontWeight: '900'}}>{event ? (event.title) : ""}
          </h1>
          <p style={{marginLeft: '20px', fontSize: '18px', 'letter-spacing': '1px', fontWeight: '500px'}}>
            {event ? (event.summary) : ""}
          </p>
          {createEventComponent_local}
          <br /><br />
        {dynamic_vote_component}
        </span>
        {dispersedComponent}
        <br/>
          <div style={{textAlign: 'center'}}>

            <button onClick={() => window.open('https://goo.gl/forms/y8JTxQyvn8LI9NWN2', "_blank")} >REPORT BUG</button>
              <br/>
                <br/>
                  <br/>

          </div>
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
