import React, { Component } from "react";

import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { createTransaction } from '../graphql/mutations';
import { getTransaction } from '../graphql/queries';
import { updateTransaction } from '../graphql/mutations';
import { listPremiumUserss } from '../graphql/queries';
import { transactionsByUserDate } from '../graphql/queries';

import { formatDate, convertDateStrToGraphqlDate } from '../common/Utilities';

// Global

var ORIGINAL_DATE = "";
var IS_DUPLICATE = false;
var IS_UPDATE = false;
const PREMIUM_USER_LIMIT = 200;
var IS_PREMIUM_USER = false;
const TXN_LIMIT = 100;
const CATEGORY_LOOKBACK_DAYS = 30;

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
      payment_method: "credit",
      type: 2,
      is_recurring: false,
      is_recurring_period: false,
      user: "",
      exampleTxnId: txnId,
      usersLatestCateogories: [],
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderButton = this.renderButton.bind(this);
  }

  componentDidMount() {
    Auth.currentAuthenticatedUser().then(user => {
      let email = user.attributes.email;

      var today = new Date();
      var catLookBack = (new Date()).setDate(today.getDate() - CATEGORY_LOOKBACK_DAYS);

      API.graphql(graphqlOperation(transactionsByUserDate, {
        limit: TXN_LIMIT,
        user: email, createdAt: { between: [catLookBack, today] }
      })).then(data => {
        var cats = [];
        for (var txn of data.data.transactionsByUserDate.items) {
          if (!cats.includes(txn.category)) {
            cats.push(txn.category);
          }
        }

        this.setState({ usersLatestCateogories: cats });

        console.log(this.state.usersLatestCateogories);
      }).catch((err) => {
        console.log(err);
      })
    }).catch((err) => {
      console.log(err);
    });

    // get premium users list
    Auth.currentAuthenticatedUser().then(user => {
      let email = user.attributes.email;

      API.graphql(graphqlOperation(listPremiumUserss, {
        limit: PREMIUM_USER_LIMIT,
        filter: {
          user: { eq: email }
        }
      })).then(data => {
        console.log(data);
        const premiumUsers = data.data.listPremiumUserss.items;
        var email = user.attributes.email;
        if (premiumUsers.length === 0) {
          IS_PREMIUM_USER = false;
        } else {
          IS_PREMIUM_USER = true;
        }

        console.log({ "IS_PREMIUM_USER": IS_PREMIUM_USER });
        console.log({ "email": email });

        if (IS_UPDATE || IS_DUPLICATE) {

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
              is_recurring: txn.is_recurring === "true" ? true : false,
              is_recurring_period: txn.is_recurring_period,
              updateTxnId: this.state.exampleTxnId
            });

          }).catch((err) => {
            window.alert("Encountered error fetching your transactions: \n", err);
          })

        } else {
          // new TXN.. so populate the payment method
          if (localStorage.getItem("payment_method") != null) {
            this.setState({ payment_method: localStorage.getItem("payment_method") });
          }
        }

      }).catch((err) => {
        console.log(err);
      })
    }).catch((err) => {
      window.alert("Encountered error fetching your username: \n", err);
    });

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

    else if (name === "full_category") {
      this.setState({
        category: value.split('-')[0],
        sub_category: ""
      });

      if (value.split('-').length > 1) {
        this.setState({
          sub_category: value.split('-')[1]
        });
      }
    } else {
      this.setState({
        [name]: value
      });
    }
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

  renderPremiumFeatures() {
    if (IS_PREMIUM_USER) {
      return (
        <div className="premiumFeatureBackground">
          <div>
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
          </div>
        </div>
      )
    } else {

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
    transaction.is_recurring = transaction.is_recurring.toString();
    console.log(transaction);
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
        transaction.createdAt = transaction.date;

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

  renderOptions() {
    var catOptions = [<option value="">{""}</option>];
    for (var cat of this.state.usersLatestCateogories) {
      catOptions.push(<option value={cat}>{cat}</option>)
    }
    return (catOptions);
  }

  render() {
    return (
      <div>
        <div className="addTransactionBackground">
          <small>* required fields</small>

          <form onSubmit={this.handleSubmit}>
            <label>
              <b>*Title:</b><br />
              <input
                className="rounded"
                name="title"
                type="text"
                value={this.state.title}
                onChange={this.handleChange} />
            </label><br />
            <label>
              <b>*Amount:</b><br />
              <input
                className="rounded"
                name="amount"
                type="text"
                value={this.state.amount}
                onChange={this.handleChange} />
            </label><br />
            <label>
              <b>*Category:</b><br />
                  Choose from previously used categories:
                  <select name="full_category" value={this.state.category + ((this.state.sub_category !== "") ? ("-" + this.state.sub_category) : "")} onChange={this.handleChange}>
                {this.renderOptions()}
              </select>
              {" "} (*or enter a new category below)
                </label>

            <label>
              <input
                className="rounded"
                name="category"
                type="text"
                placeholder="category"
                value={this.state.category}
                onChange={this.handleChange} />
            </label>

            <label>
              <input
                className="rounded"
                name="sub_category"
                placeholder="(optional) sub category"
                type="text"
                value={this.state.sub_category}
                onChange={this.handleChange} />
            </label><br />

            <label>
              <b>*Date:</b><br />
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

            <b>Payment Method:</b>
            <div className="radio">
              <label>
                <input type="radio" name='payment_method' value={"credit"}
                  checked={this.state.payment_method === "credit"}
                  onChange={this.handleChange} />
              Credit
          </label>
            </div>
            <div className="radio">
              <label>
                <input type="radio" name='payment_method' value={"debit"}
                  checked={this.state.payment_method === "debit"}
                  onChange={this.handleChange} />
              Debit
          </label>
            </div>

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

            {this.renderPremiumFeatures()}

            <br />
            {this.renderButton()}

          </form>

        </div>
      </div>
    );
  }
}
export default AddTransaction;
