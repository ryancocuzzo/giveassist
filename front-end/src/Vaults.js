import React, { Component } from 'react';
import { Button, Row, Col, InputGroup, FormControl, MenuItem, ButtonToolbar,  Dropdown, ToggleButtonGroup, ToggleButton, DropdownButton } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import firebase, { auth, provider } from './firebase.js';
import './App.css';
import variables from './variables.js';
import Datetime from 'react-datetime';
import {Elements, StripeProvider} from 'react-stripe-elements';
import CheckoutForm from './CheckoutForm';
import PaymentRequestForm from './PaymentRequestForm';
import axios from 'axios';
import Popup from 'react-popup';
import moment from 'moment';
import { get_users, get_n_events, get_reciepts_count, getUploadedReceiptsRefs} from './Database.js';
import numeral from 'numeral';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table-next';


var moneyFormat = (number) => {
  return numeral(number).format('$0,0.00');
}
let urls = variables.local_urls;
let server_urls = variables.server_urls;

class Vaults extends Component {

  constructor(props) {
      super(props);
      this.state = {
        users: null,
        events: null,
        reciepts: null,
        uploadableReciept: null,
        canCreateEvents: false,
        width: document.body.clientWidth,
        uploadedReceipts: null,
        downloadURLs: []
      };

      window.history.pushState(null, '', '/vaults')


  }

  recieptFileSelected = (files) => {
    console.log('Selected receipt now: ' + files[0]);
    this.setState({
      uploadableReciept: files[0]
    });

  }

  uploadReceipt = async () => {
    try {
      if (this.state.uploadableReciept != null && this.state.uploadableReciept != '') {

        const body = this.state.uploadableReciept;
        if (this.state.user) {
          let reciepts_count = await get_reciepts_count();
          reciepts_count = Number(reciepts_count) + 1;

          let str = '/reciepts/receipt_' + reciepts_count;

            // Create a Storage Ref w/ username
            var storageRef = firebase.storage().ref().child(str);
            console.log('Attempting to put image into ref ' + storageRef);

            storageRef.put(body).then(function(snapshot) {
              console.log('Uploaded a blob or file!');
            }).catch(function(e) {
              console.log(e);
            });

            // Post profile picture to database
           firebase.database().ref('/reciepts/total').set(reciepts_count);

           Popup.alert('Uploaded receipt!');
        } else {
          Popup.alert('You are not logged in!')
        }


      }
    } catch (e) {
      Popup.alert(e);
    }


    // else {
    //   alert('Could not upload receipt!');
    // }

  }

  /**
   * When the component mounts..
   */
  componentDidMount() {

    window.addEventListener("resize", function(event) {
      this.setState({width: document.body.clientWidth});
    }.bind(this))

    if (this.state.user) {

      this.state.user.getIdToken(/* forceRefresh */ true).then(function(idToken) {

        // Handle tokens

        this.setState({token: idToken});

        if (idToken) {
          axios.get(server_urls.eventPriviledges, {params: {idToken: idToken}}).then( function(response) {
            let canCreateEvents = response.data;
            this.setState({canCreateEvents:canCreateEvents});
          }.bind(this))
        } else {
          alert('no token')
        }

      }.bind(this)).catch(function(error) {
        // Handle error
      }.bind(this));
    } else {
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
        } else {
        }

    }.bind(this));

    get_users().then( function(users) {
      this.setState({users: users});
    }.bind(this)).catch(function(err) {
      log(err)
    })

    get_n_events(5).then(function(events) {
      this.setState({events: events});
    }.bind(this));

    getUploadedReceiptsRefs().then(function(URLs) {

      this.setState({uploadedReceipts: URLs});
      // alert('SET REC TO: ' + URLs)
      URLs.map( function(str) {
        var storageRef = firebase.storage().ref().child(str);
        storageRef.getDownloadURL().then(function(url) {
          var urls = this.state.downloadURLs;
          urls.push(url);
          this.setState({downloadURLs: urls});
        }.bind(this))
      }.bind(this))
    }.bind(this))

  }

  convert_to_iterable_object = (jsonObject) => {

    var objArray = [];

    if (jsonObject) {

      Object.keys(jsonObject).forEach(function(key) {
        var temp = {}
        temp.key = key;
        temp.value = jsonObject[key];
        objArray.push(temp);
      });

    }

    return objArray;
  }

  doSomething = () => {
    console.log('X');
  }

  formattedTextH3 = (text) => {
    return <h3>{text}</h3>
  }

  render () {
    var fontSize = '20px';
    var col_width_wide = '250px';

    if (this.state.width < 700) {
      fontSize = '17px';
      col_width_wide = '200px';
    }
    var userComponent;
    var eventsComponent;

    if (this.state.users) {
      var count = 1;
      var c = (count) => {return (count % 2 ? '#474747' : '#333232')};
      var objArray = this.convert_to_iterable_object(this.state.users);
      userComponent = objArray.map(function(user) {
        count++;
        return <div>
                <div className='adjacentItemsParent' style={{backgroundColor: c(count), margin: '8px', borderRadius: '7px', color: 'white', fontWeight: '700'}}>
                  <h3 style={{marginLeft: '50px', fontSize: fontSize, width: col_width_wide}} >{user.value.dn}</h3><br/>
                <h3 style={{marginLeft: '50px', fontSize: fontSize}} className='fixedAdjacentChild'>{user.value.p}</h3><br/>
                  <br />
                </div>
              </div>
      }.bind(this))
    } else {
      userComponent = <div></div>;
    }

    if (this.state.events) {
      var count = 1;
      var c = (count) => {return (count % 2 ? '#474747' : '#333232')};
      var objArray = this.convert_to_iterable_object(this.state.events);
      eventsComponent = objArray.map(function(event) {
        var topBorder = (count == 1 ? '1px solid black' : '')
        count++;
        return <div >
                <div className='adjacentItemsParent' style={{backgroundColor: c(count), margin: '8px', borderRadius: '7px', color: 'white', fontWeight: '700'}}>
                  <h3 style={{marginLeft: '50px', fontSize: fontSize, width: col_width_wide}}>{event.value.id}</h3><br/>
                <h3 style={{marginLeft: '50px', fontSize: fontSize}} className='fixedAdjacentChild'>{moneyFormat(event.value.ttl*0.01)}</h3><br/>
                  <br />
                </div>
              </div>
      }.bind(this))
    } else {
      eventsComponent = <div></div>;
    }

    var uploadReceiptComponent = (this.state.canCreateEvents ? (
      <div >
        <form className='adjacentItemsParent'>
          <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>PICTURE</h1><br/>
        <input style={{marginTop: '10px', backgroundColor: 'transparent', boxShadow: '0px'}} type="file" name="im-a-file-a2" onChange={ (e) => this.recieptFileSelected(e.target.files) } />
      </form>
      <button style={{marginLeft: '20px'}} onClick={this.uploadReceipt }>UPLOAD</button>
      </div>
    ) : (
      <div></div>
    ))

    var receiptsComponent;
    // alert('UPLOADED REC: ' + this.state.uploadedReceipts)

    if (this.state.downloadURLs != null) {
      // alert('Have uploaded receipts!');
      receiptsComponent = this.state.downloadURLs.map( function(url) {
            return (
              <div>
                <a href={url} className='button' >VIEW</a>
              </div>
            );
      }.bind(this))
    } else {
      console.log('DID NOT UPLOAD');
      receiptsComponent = <div></div>
    }

    return (
      <div style={{ borderRadius: '7px', fontSize: '12px'}} className='myGradientBackground'>
        <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>
        {uploadReceiptComponent}
        <br/>
        <br/>

        <div >
          <h1 className='adjacentItemsParent'  style={{marginLeft: '10px'}}>USERS</h1>
        <div className='adjacentItemsParent'>
            <h3 style={{marginLeft: '50px', fontSize: '22px', fontWeight: 'bold', width: col_width_wide}} >Display Name</h3><br/>
          <h3 style={{marginLeft: '50px', fontSize: '22px', fontWeight: 'bold'}} className='fixedAdjacentChild'>Plan</h3><br/>
            <br />
          </div>
        {userComponent}
        </div>
        <br />
        <br/>
        <br/>

        <div>
          <h1 style={{marginLeft: '10px'}}>EVENTS</h1>
          <div className='adjacentItemsParent'>
            <h3 style={{marginLeft: '50px', fontSize: '22px', fontWeight: 'bold', width: col_width_wide}}>Event ID</h3><br/>
          <h3 style={{marginLeft: '50px', fontSize: '22px', fontWeight: 'bold'}} className='fixedAdjacentChild'>Total</h3><br/>
            <br />
          </div>
        {eventsComponent}
        </div>
        <br />
        <br/>
        <br/>
      <h1 style={{marginLeft: '10px'}}>RECEIPT INVENTORY</h1>
    <div style={{marginLeft: '50px'}}>
      {receiptsComponent}
    </div>
        <br/>
        <br/>
        <br/>
          <div style={{textAlign: 'center'}}>
            <button onClick={() => window.open('https://goo.gl/forms/y8JTxQyvn8LI9NWN2', "_blank")} >REPORT BUG</button>
              <br/>
                <br/>
                  <br/>

          </div>
      <div style={{height: '210px'}}></div>
      </div>
    )
  }


}

function log(x) {
  console.log(x);
}

export default Vaults;
