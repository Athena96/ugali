import * as React from 'react';

import '../App.css';
import Box from '@mui/material/Box';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { createBudgetDB, getBudgetForUserDB, updateBudgetDB } from '../dataAccess/BudgetDataAccess';
import { Budget } from '../model/Budget';
import { Category } from '../model/Category';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { cleanNumberDataInput } from '../utilities/helpers';


interface BudgetViewProps {
  user: string;
}

interface IState {
  budget: Budget | undefined
}


class BudgetView extends React.Component<BudgetViewProps, IState> {

  constructor(props: BudgetViewProps) {
    super(props);
    this.state = {
      budget: undefined
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.render = this.render.bind(this);

  }

  async componentDidMount() {
    let budget = await getBudgetForUserDB(this.props.user)
    if (!budget) {
      budget = new Budget(new Date().getTime().toString(), 'default_budget', new Date(), new Date(), new Date(), this.props.user, [])
      await createBudgetDB(budget);
    }
    this.setState({ budget })
  }


  async handleDeleteCategory(category: Category) {

    if (this.state.budget) {
      const catIdToDelete = category.id;
      const budget = this.state.budget;
      const newCategories = budget.categories.filter((category) => category.id !== catIdToDelete);
      budget.categories = newCategories;
      this.setState({ budget });
      await this.saveBudget();
    }

  }

  handleCategoryNameUpdate(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, i: number) {
    const newVal = event.target.value;
    if (this.state.budget) {
      const b = this.state.budget;
      b.categories![i].name = newVal;
      this.setState({ budget: b })
    }
  }

  handleCateogryValueUpdate(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, i: number) {
    const newVal = event.target.value;
    if (this.state.budget) {
      const b = this.state.budget;
      b.categories![i].setValue(cleanNumberDataInput(newVal));
      this.setState({ budget: b })
    }
  }

  addCategory() {
    if (this.state.budget && this.state.budget.categories) {
      let newCategories = [...this.state.budget.categories, new Category(new Date().getTime().toString(), '...', 0.0)]
      const budget = this.state.budget;
      budget.categories = newCategories;
      this.setState({ budget })
    }
  }

  async saveBudget() {
    if (this.state.budget) {
      try {
        await updateBudgetDB(this.state.budget);
      } catch (e) {
        console.error(e)
      }
    }
  }

  getBudgetTotal() {
    let sum = 0.0
    if (this.state.budget) {
      for (const c of this.state.budget.categories) {
        sum += c.value
      }

    }
    return sum;
  }
  render() {
    const isMobile = window.innerWidth <= 390;

    if (this.state.budget) {
      return (
        <Box >
          <h2>Budget <small> - <i>${this.getBudgetTotal().toFixed(2)}</i></small></h2>
          <hr />
          <br />
          {this.state.budget.categories.map((category, i) => {

            return (
              <>
                <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
                  <TextField sx={{ width: isMobile ? '100%' : '55%' }} label={'description'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleCategoryNameUpdate(event, i)} value={category.name} />
                  <TextField sx={{ width: isMobile ? '100%' : '40%' }} label={'amount'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleCateogryValueUpdate(event, i)} InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        Monthly
                      </InputAdornment>
                    ),
                  }} value={category.strVal}></TextField>
                  <Button onClick={(event) => this.handleDeleteCategory(category)} sx={{ width: isMobile ? '100%' : '5%' }} variant="outlined"><HighlightOffIcon /></Button>
                </Stack>
                <br />
              </>
            )
          })}


          <Button sx={{ width: '100%' }} onClick={(event) => this.addCategory()} variant="outlined"><AddCircleIcon /></Button>
          <br />
          <br />
          <Button sx={{ width: '100%' }} onClick={(event) => this.saveBudget()} variant="outlined">save</Button>


        </Box >
      )
    } else {
      return (<></>)
    }

  }


}

export default BudgetView;
