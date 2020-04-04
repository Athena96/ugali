import React, { Component } from "react";

import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { createTransaction } from '../graphql/mutations';
import { getTransaction } from '../graphql/queries';
import { updateTransaction } from '../graphql/mutations';

import { formatDate,  convertDateStrToGraphqlDate } from '../common/Utilities';

var ORIGINAL_DATE = "";
var IS_DUPLICATE = false;
var IS_UPDATE = false;

class AddTransaction extends Component {

  constructor(props) {
    super(props);

    var txnId = null;

    IS_DUPLICATE = props.history.location.pathname.split('/')[2] === "duplicate";
    IS_UPDATE = props.history.location.pathname.split('/')[2] === "update";

    console.log("IS_DUPLICATE: ", IS_DUPLICATE);
    console.log("IS_UPDATE: ", IS_UPDATE);

    if (IS_UPDATE || IS_DUPLICATE) {
      txnId = props.history.location.pathname.split('/')[3];
      console.log("UPDATE OR DUPLICATE: ", txnId)
    }

    var strDate = formatDate(new Date());
    this.state = {
      title: "",
      amount: "0.00",
      category: "",
      sub_category: "",
      date: strDate,
      description: "",
      payment_method: "",
      type: 2,
      is_recurring: false,
      is_recurring_period: false,
      user: "",
      exampleTxnId: txnId
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderButton = this.renderButton.bind(this);
  }

  componentDidMount() {

    if (IS_UPDATE || IS_DUPLICATE) {
      Auth.currentAuthenticatedUser().then(user => {
        let email = user.attributes.email;

        API.graphql(graphqlOperation(getTransaction, { id: this.state.exampleTxnId })).then(data => {

          if (data.data.getTransaction.user !== email) {
            window.alert("Couldn't find the transaction.");
            return;
          }
          const txn = data.data.getTransaction;
          console.log(txn);
          var dt = txn.date.split('-')[0] + "-" + txn.date.split('-')[1] + "-" + txn.date.split('-')[2].split('T')[0];
          ORIGINAL_DATE = txn.date;

          var cat = txn.category;
          var subCat = "";

          if (cat.includes('-')) {
            cat = txn.category.split('-')[0];
            subCat = txn.category.split('-')[1];
          }

          this.setState({
            title: txn.title,
            amount: txn.amount,
            category: cat,
            sub_category: subCat,
            date: dt,
            description: txn.description === null ? "" : txn.description,
            payment_method: txn.payment_method,
            type: txn.type,
            user: txn.user,
            is_recurring: txn.is_recurring,
            is_recurring_period: txn.is_recurring_period,
            updateTxnId: this.state.exampleTxnId
          });

        }).catch((err) => {
          window.alert("Encountered error fetching your transactions: \n", err);
        })

      }).catch((err) => {
        window.alert("Encountered error fetching your username: \n", err);
      });
    } else {
      // new TXN.. so populate the payment method
      if (localStorage.getItem("payment_method") != null) {
        this.setState({ payment_method: localStorage.getItem("payment_method") });
      }
    }

  }

  handleChange(event) {
    var target = event.target;
    var value = target.type === 'checkbox' ? target.checked : target.value;
    var name = target.name;
    console.log(value);
    console.log(name);

    if (name === "type") {
      value = parseInt(value);
    }
    this.setState({
      [name]: value
    });
  }

  renderButton() {
    if (IS_UPDATE) {
      return (
        <input class="updateButton" type="submit" value="Update" />
      )
    } else {
      return (
        <input class="addButton" type="submit" value="Submit" />
      )
    }
  }

  resetState() {
    var strDate = formatDate(new Date());
    this.setState({
      title: "",
      amount: "0.00",
      category: "",
      sub_category: "",
      date: strDate,
      description: "",
      type: 2,
      is_recurring: false,
      is_recurring_period: false,
      user: "",
      updateTxnId: null
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

    if (this.state.payment_method === "") {
      window.alert("Please add a 'Payment Method'");
      return;
    } else {
      if (localStorage.getItem("payment_method") == null || (localStorage.getItem("payment_method") != null && localStorage.getItem("payment_method") != this.state.payment_method)) {
        localStorage.setItem("payment_method", this.state.payment_method);
      }
    }

    // get current user and set state
    var user = await Auth.currentAuthenticatedUser();
    var email = user.attributes.email;

    // reformat date "2020-03-29T19:06:28.446Z";
    var formattedDate = convertDateStrToGraphqlDate(this.state.date);

    var fullCat = "";
    if (this.state.sub_category != "") {
      fullCat = this.state.category + "-" + this.state.sub_category;
    } else {
      fullCat = this.state.category;
    }

    // extract txn from state.
    var transaction = {};
    if (IS_UPDATE) {
      var d = "";
      if (ORIGINAL_DATE.split('-')[2].split('T')[0] == this.state.date.split('-')[2] 
      && ORIGINAL_DATE.split('-')[1] == this.state.date.split('-')[1]
      && ORIGINAL_DATE.split('-')[0] == this.state.date.split('-')[0]) {
        d = ORIGINAL_DATE;
      } else {
        d = convertDateStrToGraphqlDate(this.state.date);
      }

      transaction = {
        id: this.state.exampleTxnId,
        title: this.state.title,
        amount: this.state.amount,
        category: fullCat,
        date: d,
        description: this.state.description,
        payment_method: this.state.payment_method,
        type: this.state.type,
        is_recurring: this.state.is_recurring,
        is_recurring_period: this.state.is_recurring_period,
        user: this.state.user
      }

    } else {
      transaction = {
        title: this.state.title,
        amount: this.state.amount,
        category: fullCat,
        date: this.state.date,
        description: this.state.description,
        payment_method: this.state.payment_method,
        type: this.state.type,
        is_recurring: this.state.is_recurring,
        is_recurring_period: this.state.is_recurring_period,
        user: this.state.user
      }

      transaction.date = formattedDate;
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
    transaction.amount = numberAmount;

    // remove whitespace
    transaction.title = transaction.title.trim();
    transaction.category = transaction.category.trim();
    if (transaction.description != null) {
      transaction.description = transaction.description.trim();
    }
    transaction.payment_method = transaction.payment_method.trim();

    // submit
    try {

      if (IS_UPDATE) {
        console.log("UPDATE TXN...");
        const res = await API.graphql(graphqlOperation(updateTransaction, { input: transaction }));
        console.log("SUCCESS! \n", res);
        window.alert("Successfully updated your transaction!");
      } else {
        console.log("ADD TXN...");
        console.log(transaction);

        const res = await API.graphql(graphqlOperation(createTransaction, { input: transaction }));
        console.log("SUCCESS! \n", res);
        window.alert("Successfully added your transaction!");
      }
      this.resetState();

    } catch (err) {
      console.log("FAILURE! \n", err);
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
      <div className="addTransactionBackground">
       
        <form onSubmit={this.handleSubmit}>
          <label>
            <b>Title:</b><br />
            <input
              className="rounded"
              name="title"
              type="text"
              value={this.state.title}
              onChange={this.handleChange} />
          </label><br />
          <label>
            <b>Amount:</b><br />
            <input
              className="rounded"
              name="amount"
              type="text"
              value={this.state.amount}
              onChange={this.handleChange} />
          </label><br />
          <label>
            <b>Category:</b>
            <input
              className="rounded"
              name="category"
              type="text"
              value={this.state.category}
              onChange={this.handleChange} />
          </label><br />
          <label>
            <i>Sub-Category (optional):</i>
            <input
              className="rounded"
              name="sub_category"
              type="text"
              value={this.state.sub_category}
              onChange={this.handleChange} />
          </label><br />

          <label>
            <b>Date:</b><br />
            <input
              className="rounded"
              name="date"
              type="date"
              value={this.state.date}
              onChange={this.handleChange} />
          </label><br />
          <label>
            <b>Description:</b><br />
            <textarea
              className="rounded"
              name="description"
              type="text"
              value={this.state.description}
              onChange={this.handleChange} />
          </label><br />
          <label>
            <b>Payment Method:</b><br />
            <input
              className="rounded"
              name="payment_method"
              type="text"
              value={this.state.payment_method}
              onChange={this.handleChange} />
          </label><br />

          <b>Expense or Income?:</b>
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

          <label>
            <b>Place on 'Time Travel'?:</b>
            <input
              name="is_recurring"
              type="checkbox"
              checked={this.state.is_recurring}
              onChange={this.handleChange} />
          </label><small>*The transaction will appear on your 'Time Travel' page.*</small><br />

          <label>
            <i>- Make recurring?:</i>
            <input
              name="is_recurring_period"
              type="checkbox"
              checked={this.state.is_recurring_period}
              onChange={this.handleChange} />
          </label><small>*A recurring transaction will appear on your 'Time Travel' page, each month, on the chosen date.*</small><br />


          <br />
          {this.renderButton()}

        </form>

      </div>
      </div>
    );
  }
}
export default AddTransaction;