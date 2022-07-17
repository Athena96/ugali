
import * as React from 'react';


import { Switch, Route } from 'react-router-dom';
import AddEditTransactionView from './AddEditTransactionView';
import BudgetView from './BudgetView';
import DashboardView from './DashboardView';
import TransactionsView from './TransactionsView';


interface InputsViewProps {
  user: string

}

interface IState {
  name: string

}

class Main extends React.Component<InputsViewProps, IState> {

  constructor(props: InputsViewProps) {
    super(props);
    this.state = {
      name: "string"

    }
    this.render = this.render.bind(this);
  }

  render() {
    return (
      <Switch>
        <Route exact path="/" render={(props) =>  <DashboardView  user={this.props.user}/>}/>
        <Route path="/transactions" render={(props) =>  <TransactionsView  user={this.props.user}/>}/>
        <Route path="/transaction" render={(props) =>  <AddEditTransactionView  user={this.props.user} closeDialog={ undefined }/>} />
        <Route path="/budget" render={(props) =>  <BudgetView  user={this.props.user} />} />
      </Switch>
    );
  }
}

export default Main;
