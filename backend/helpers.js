String.prototype.replaceAll = function(search, replacement) {
  var target = this + '';
  return target.split(search).join(replacement);
};


var validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

var validatePhone = (phone) => {
   var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
   return re.test(String(phone));
}

var extractPhoneNumber = (uncleaned) => {
  var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
  return cleaned;
}

// var comparePhoneNumbers  = (a, b) => {
//   var same_10 = (extractPhoneNumber(a).slice(-10) == extractPhoneNumber(b).slice(-10));
//   return same_10; // no country compare yet
// }

// var makeid = () => {
//   var length = 6;
//   var result           = '';
//   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//      result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

var randstring = (l) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < l; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function Customer(cid, amt_contributed) {
  this.CustomerId = cid;
  this.AmountContributed = '$' + amt_contributed;
}

function User(name, email, password, plan, displayName, joined,  phoneNumber) {
  this.Name = name;
  this.Email = email;
  this.Password = password;
  this.Plan = plan;
  this.DisplayName = displayName;
  this.Joined = joined;
  this.PhoneNumber = phoneNumber;
}

rNumber = () => {
  var length = 3;
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
  }

  const getToday = () => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    var td = mm + '/' + dd + '/' + yyyy;
    return td;
  }

module.exports = {
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    extractPhoneNumber: extractPhoneNumber,
    // comparePhoneNumbers: comparePhoneNumbers,
    // makeid: makeid,
    randstring: randstring,
    Customer: Customer,
    User: User,
    rNumber: rNumber,
    getToday: getToday
}
