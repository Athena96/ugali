import * as React from 'react';

import '../App.css';

import { PaymentMethod, Transaction, TransactionType } from '../model/Transaction';
import { createTransactionDB, getTransactionDB, updateTransactionDB } from '../dataAccess/TransactionDataAccess';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { FormControl, SelectChangeEvent, InputLabel, Select, MenuItem } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';


interface AddTransactionViewProps {
    user: string
    categories: string[]
    closeDialog: (() => void) | undefined;
}

interface AddTransactionViewState {
    transaction: Transaction;
    amountString: string;
    isNewTransaction: boolean;
    newCategory: boolean
}

class AddTransactionView extends React.Component<AddTransactionViewProps, AddTransactionViewState> {

    constructor(props: AddTransactionViewProps) {
        super(props);
        const transactionId: string | undefined = window.location.pathname.split('/')[2];
        const next: string | undefined = window.location.pathname.split('/')[3];
        this.state = {
            newCategory: false,
            isNewTransaction: transactionId.length > 4 && next === undefined ? false : true,
            amountString: "0.0",
            transaction: new Transaction(
                (new Date().getTime()).toString(),
                "...",
                0.0,
                "random",
                new Date(),
                "",
                PaymentMethod.Credit,
                TransactionType.Expense,
                new Date(),
                new Date(),
                this.props.user
            )
        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
    }

    async componentDidMount() {
        if (this.state.isNewTransaction === false) {
            const transactionId = window.location.pathname.split('/')[2]
            const transaction = await getTransactionDB(transactionId, this.props.user)
            if (transaction) {
                this.setState({ transaction, amountString: transaction.amount.toFixed(2) });
            }
        }

    }

    async saveTransaction(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, transaction: Transaction) {
        try {
            transaction.amount = parseFloat(this.state.amountString);
            if (this.state.isNewTransaction) {
                await createTransactionDB(transaction)
            } else {
                await updateTransactionDB(transaction)
            }
        } catch (err) {
            console.error('error creating todo:', err)
        }

        if (this.props.closeDialog) {
            this.props.closeDialog();
        }
    }

    handleTitleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newTitle = event.target.value;
        if (this.state.transaction) {
            const transaction = this.state.transaction;
            transaction.title = newTitle;
            this.setState({ transaction })
        }
    }

    handleAmountChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newAmountString = event.target.value;

        this.setState({ amountString: newAmountString })
    }

    handleCategoryChange(event: SelectChangeEvent) {
        const selectedSimulationName = event.target.value as string;
        if (selectedSimulationName === 'new') {
            this.setState({ newCategory: true })
            return;
        }
        if (this.state.transaction) {
            const transaction = this.state.transaction;
            transaction.category = selectedSimulationName;
            this.setState({ transaction })
        }
    }

    handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newDescription = event.target.value;
        if (this.state.transaction) {
            const transaction = this.state.transaction;
            transaction.description = newDescription;
            this.setState({ transaction })
        }
    }

    handleDateChange(newDate: Date | null) {
        if (this.state.transaction && newDate) {
            const transaction = this.state.transaction;
            transaction.date = newDate;
            transaction.updatedAt = newDate;
            this.setState({ transaction })
        }
    }


    handleNewCategoryChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newCat = event.target.value;
        if (this.state.transaction) {
            const transaction = this.state.transaction;
            transaction.category = newCat;
            this.setState({ transaction })
        }
    }
   

    render() {

        if (this.state.transaction && this.props.categories) {
            const title = this.state.isNewTransaction ? "Add Transaction" : "Edit Transaction";
            return (
                <>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        </DialogContentText>

                        <Stack direction='column' spacing={2}>
                            <br />
                            <TextField label={'Title'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleTitleChange(event)} value={this.state.transaction.title} />
                            <TextField label={'Amount'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleAmountChange(event)} value={this.state.amountString} />
                            {this.state.newCategory ? 
                            <TextField label={'Category'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleNewCategoryChange(event)} value={this.state.transaction.category} />
                                : <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.transaction.category}
                                    label="category"
                                    onChange={this.handleCategoryChange}
                                >
                                    {this.props.categories.map((category) => {
                                        return (<MenuItem value={category}>{category}</MenuItem>)
                                    })}
                                    <MenuItem value={'new'}>+</MenuItem>
                                </Select>
                            </FormControl>}

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Date"
                                    value={this.state.transaction.date}
                                    onChange={(newDate) => this.handleDateChange(newDate)}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                            <TextField label='Description' id="outlined-multiline-static" multiline rows={4} onChange={(event) => this.handleDescriptionChange(event)} value={this.state.transaction.description} />
                        </Stack>



                    </DialogContent>

                    <DialogActions>
                        {this.props.closeDialog && <Button onClick={this.props.closeDialog}>Cancel</Button>}
                        <Button onClick={(e) => this.saveTransaction(e, this.state.transaction)}>Save</Button>
                    </DialogActions>
                </>

            )
        } else {
            return (<></>)
        }

    }
}

export default AddTransactionView;
