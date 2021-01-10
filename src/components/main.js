import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AddTransaction from "./AddTransaction";
import Transactions from './Transactions';
import About from './About';
import Premium from './Premium';

const Main = () => (
  <Switch>
    <Route exact path="/" component={Transactions} />
    <Route path="/home" component={Transactions} />

    <Route path="/transactions" component={Transactions} />
    <Route path="/addTransaction" component={AddTransaction} />
    <Route path="/about" component={About} />
    <Route path="/premium" component={Premium} />
  </Switch>
)

export default Main;