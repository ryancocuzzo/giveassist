const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return re.test(String(phone));
};

const extractPhoneNumber = (uncleaned) => {
  const cleaned = String(uncleaned).replace(/[()+ -]/g, '');
  return cleaned;
};

const randstring = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function Customer(cid, amt_contributed) {
  this.CustomerId = cid;
  this.AmountContributed = '$' + amt_contributed;
}

function User(name, email, password, plan, displayName, joined, phoneNumber) {
  this.Name = name;
  this.Email = email;
  this.Password = password;
  this.Plan = plan;
  this.DisplayName = displayName;
  this.Joined = joined;
  this.PhoneNumber = phoneNumber;
}

const getToday = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  return mm + '/' + dd + '/' + yyyy;
};

module.exports = {
  validateEmail,
  validatePhone,
  extractPhoneNumber,
  randstring,
  Customer,
  User,
  getToday
};
