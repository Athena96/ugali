import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AddTransaction from "./AddTransaction";
import Transactions from './Transactions';
import TimeTravel from './TimeTravel';
import Friends from './Friends';
import About from './About';

const Main = () => (
  <Switch>
    <Route exact path="/" component={Transactions} />
    <Route path="/transactions" component={Transactions} />
    <Route path="/timeTravel" component={TimeTravel} />
    <Route path="/friends" component={Friends} />
    <Route path="/addTransaction" component={AddTransaction} />
    <Route path="/about" component={About} />
  </Switch>
)

export default Main;