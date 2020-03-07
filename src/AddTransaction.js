import React, { Component } from "react";

import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { createTransaction } from './graphql/mutations';
import { getTransaction } from './graphql/queries';
import { updateTransaction } from './graphql/mutations';

function getDoubleDigitFormat(number) {
  return (number < 10) ? "0"+number : number; 
}

function formatDate(date) {
  var month = getDoubleDigitFormat(date.getMonth()+1);
  var day = getDoubleDigitFormat(date.getDate());
  return date.getFullYear() + '-' + month + '-' + day;
}

function convertDateStrToGraphqlDate(dateStr) {
  var dateParts = dateStr.split('-');
  if (dateParts.length >= 3) {
    var year = dateParts[0];
    var month = dateParts[1];
    var day = dateParts[2];

    var currTime = new Date();
    var hour = getDoubleDigitFormat(currTime.getHours());
    var min = getDoubleDigitFormat(currTime.getMinutes());
    var sec = getDoubleDigitFormat(currTime.getSeconds());
    var formattedString = year + '-' + month + '-' + day + 'T' + hour + ':' + min + ':' + sec  + '.000Z';
    console.log("formattedString: ", formattedString);
    return formattedString;
  }
}

class AddTransaction extends Component {

  constructor(props) {
    super(props);

    var txnId = null;
    if (props.history.location.pathname.split('/')[2] !== "") {
      txnId = props.history.location.pathname.split('/')[2];

    } 

    var strDate =  formatDate(new Date());
      this.state = {
        title: "",
        amount: "0.00",
        category: "",
        date: strDate,
        description: "",
        payment_method: "",
        type: 2 ,
        user: "",
        updateTxnId: txnId
      };
    
    this.componentDidMount = this.componentDidMount.bind(this); 

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderButton = this.renderButton.bind(this);

    
  }

  componentDidMount() {
console.log("componentDidMount");
    if (this.state.updateTxnId != null) {
      Auth.currentAuthenticatedUser().then(user => {
        let email = user.attributes.email;
  
        console.log("Fetching transactions for: " + email);
        API.graphql(graphqlOperation(getTransaction, { id: this.state.updateTxnId })).then(data => {
          console.log(data);
          const txn = data.data.getTransaction;
          console.log(txn.date);

         var dt = txn.date.split('-')[0]+"-"+txn.date.split('-')[1] + "-" + txn.date.split('-')[2].split('T')[0];
            this.setState({
              title: txn.title,
              amount: txn.amount,
              category: txn.category,
              date: dt,
              description: txn.description === null ? "" : txn.description,
              payment_method: txn.payment_method,
              type: txn.type,
              user: txn.user,
              updateTxnId: this.state.updateTxnId
            });
  
        }).catch((err) => {
            window.alert("Encountered error fetching your transactions: \n",err);
        })
        
    }).catch((err) => {
        window.alert("Encountered error fetching your username: \n",err);
    });
    }
    
  }

  handleChange(event) {
    var target = event.target;
    var value = target.type === 'checkbox' ? target.checked : target.value;
    var name = target.name;

    if (name === "type") {
      value = parseInt(value);
    } 
    this.setState({
      [name]: value
    });
  }

  renderButton() {

    if (this.state.updateTxnId != null) {
      return(
        <input class="updateButton" type="submit" value="Update" />
      )
    } else {
      return(
        <input class="addButton" type="submit" value="Submit" />
      )
    }
    
  }

  resetState() {
    var strDate =  formatDate(new Date());
    this.setState({
      title: "",
      amount: "0.00",
      category: "",
      date: strDate,
      description: "",
      payment_method: "",
      type: 2 ,
      user: "",
      updateTxnId: ""
    });
  }

  async handleSubmit(e) {
    // todo ?
    e.preventDefault();

    // check empty fields
    if (this.state.title === undefined || this.state.title === null || this.state.title === "") {
      window.alert("Please add a 'Title'");
      return;
    }

    if (this.state.amount === undefined || this.state.amount === null || this.state.amount === "") {
      window.alert("Please add a 'Amount'");
      return;
    }

    if (this.state.category === undefined || this.state.category === null || this.state.category === "") {
      window.alert("Please add a 'Category'");
      return;
    }

    if (this.state.payment_method === undefined || this.state.payment_method === null || this.state.payment_method === "") {
      window.alert("Please add a 'Payment Method'");
      return;
    }

    // get current user and set state
    var user = await Auth.currentAuthenticatedUser();
    var email = user.attributes.email;

    // reformat date "2020-03-29T19:06:28.446Z";
    var formattedDate = convertDateStrToGraphqlDate(this.state.date);

    // extract txn from state.
    var transaction = {};
    if (this.state.updateTxnId == null) {
      transaction = {
        title: this.state.title,
        amount: this.state.amount,
        category: this.state.category,
        date: this.state.date,
        description: this.state.description,
        payment_method: this.state.payment_method,
        type: this.state.type,
        user: this.state.user
    }
    } else {
      transaction = {
        id: this.state.updateTxnId,
        title: this.state.title,
        amount: this.state.amount,
        category: this.state.category,
        date: this.state.date,
        description: this.state.description,
        payment_method: this.state.payment_method,
        type: this.state.type,
        user: this.state.user
    }
    }
   
    // fill in description
    if (transaction.description === '') {
        transaction.description = null;
    }

    // update amount
    let numberAmount = parseFloat(this.state.amount);
    if (isNaN(numberAmount)) {
      numberAmount = 0.00;
    }

    // update state before submit
    transaction.user = email;
    transaction.date = formattedDate;
    transaction.amount = numberAmount;

    // log the txn to be added
    console.log("Adding Transaction:");
    console.log(transaction);
    this.resetState();

    // submit
    try {

      if (this.state.updateTxnId == null) {
        const res = await API.graphql(graphqlOperation(createTransaction, { input: transaction }));
        console.log("SUCCESS! \n",res);
        window.alert("Successfully added your transaction!");
      } else {
        // UPDATE
        const res = await API.graphql(graphqlOperation(updateTransaction, { input: transaction }));
        console.log("SUCCESS! \n",res);
        window.alert("Successfully updated your transaction!");
      }
      
    } catch(err) {
      console.log("FAILURE! \n",err);
      var errorMessages = [];
      for (var error of err.errors) {
        errorMessages.push(error.message);
      }
      var errorStr = errorMessages.join(", ");
      window.alert(errorStr);
    }
  }

  render() {
    return (
      <div className="addTransactionBackground">
      <form onSubmit={this.handleSubmit}>
        <label>
          Title:<br />
          <input
            className="rounded"
            name="title"
            type="text"
            value={this.state.title}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Amount:<br />
          <input
            className="rounded"
            name="amount"
            type="text"
            value={this.state.amount}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Category:<br />
          <input
            className="rounded"
            name="category"
            type="text"
            value={this.state.category}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Date:<br />
          <input
          className="rounded"
            name="date"
            type="date"
            value={this.state.date}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Description:<br />
          <textarea
            className="rounded"
            name="description"
            type="text"
            value={this.state.description}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Payment Method:<br />
          <input
            className="rounded"
            name="payment_method"
            type="text"
            value={this.state.payment_method}
            onChange={this.handleChange} />
        </label><br />

          <div className="radio">
            <label>
              <input type="radio" name='type' value={2}
                      checked={this.state.type === 2} 
                      onChange={this.handleChange} />
                      Expense
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name='type' value={1}
                      checked={this.state.type === 1} 
                      onChange={this.handleChange} />
              Income
            </label>
            </div>
        <br />
        {this.renderButton()}

      </form>
   
      </div>
    );
  }
}
export default AddTransaction;