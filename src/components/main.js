import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AddTransaction from "./AddTransaction";
import Transactions from './Transactions';
import Timeline from './Timeline';


const Main = () => (
  <Switch>
    <Route exact path="/" component={Transactions} />
    <Route path="/transactions" component={Transactions} />
    <Route path="/timeline" component={Timeline} />
    <Route path="/addTransaction" component={AddTransaction} />
  </Switch>
)

export default Main;