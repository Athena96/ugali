import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AddTransaction from "./AddTransaction";
import Transactions from './Transactions';
import TimeTravel from './TimeTravel';


const Main = () => (
  <Switch>
    <Route exact path="/" component={Transactions} />
    <Route path="/transactions" component={Transactions} />
    <Route path="/timeTravel" component={TimeTravel} />
    <Route path="/addTransaction" component={AddTransaction} />
  </Switch>
)

export default Main;