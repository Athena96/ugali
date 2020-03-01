import React, { Component } from "react";

import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { createTransaction } from './graphql/mutations';

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
    var strDate =  formatDate(new Date());

    this.state = {
      title: "",
      amount: "0.00",
      category: "",
      date: strDate,
      description: "",
      payment_method: "",
      type: 2 ,
      user: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    var target = event.target;
    var value = target.type === 'checkbox' ? target.checked : target.value;
    var name = target.name;

    if (name === "type") {
      value = value ? 2 : 1;
    } 

    this.setState({
      [name]: value
    });
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
      user: ""
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
    var transaction = {
        title: this.state.title,
        amount: this.state.amount,
        category: this.state.category,
        date: this.state.date,
        description: this.state.description,
        payment_method: this.state.payment_method,
        type: this.state.type,
        user: this.state.user
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
      const res = await API.graphql(graphqlOperation(createTransaction, { input: transaction }));
      console.log("SUCCESS! \n",res);
      window.alert("Successfully added your transaction!");
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
      <div>
      <form onSubmit={this.handleSubmit}>
        <label>
          Title:
          <input
            name="title"
            type="text"
            value={this.state.title}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Amount:
          <input
            name="amount"
            type="text"
            value={this.state.amount}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Category:
          <input
            name="category"
            type="text"
            value={this.state.category}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Date:
          <input
            name="date"
            type="date"
            value={this.state.date}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Description:
          <textarea
            name="description"
            type="text"
            value={this.state.description}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Payment Method:
          <input
            name="payment_method"
            type="text"
            value={this.state.payment_method}
            onChange={this.handleChange} />
        </label><br />
        <label>
          Is Expense?:
          <input
            name="type"
            type="checkbox"
            checked={(this.state.type === 2 ? true : false)}
            onChange={this.handleChange} />
        </label><br />
        <input type="submit" value="Submit" />
      </form>
   
      </div>
    );
  }
}
export default AddTransaction;
