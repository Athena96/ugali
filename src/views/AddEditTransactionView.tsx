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
import { LocalizationProvider, DatePicker }from '@mui/lab';

import AdapterDateFns from '@mui/lab/AdapterDateFns';


interface AddTransactionViewProps {
    user: string
    closeDialog: (() => void) | undefined;
}

interface AddTransactionViewState {
    transaction: Transaction;
    amountString: string;
    isNewTransaction: boolean;
}

class AddTransactionView extends React.Component<AddTransactionViewProps, AddTransactionViewState> {

    constructor(props: AddTransactionViewProps) {
        super(props);
        const transactionId: string | undefined = window.location.pathname.split('/')[2];
        this.state = {
            isNewTransaction: transactionId ? false : true,
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
    }

    async componentDidMount() {
        if (this.state.isNewTransaction === false) {
            const transactionId = window.location.pathname.split('/')[2]
            const transaction = await getTransactionDB(transactionId, this.props.user)
            if (transaction) {
                this.setState({transaction, amountString: transaction.amount.toFixed(2)});
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
 
    handleCategoryChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const newCategory = event.target.value;
        if (this.state.transaction) {
            const transaction = this.state.transaction;
            transaction.category = newCategory;
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

    render() {

        if (this.state.transaction) {
            return (
                <>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        </DialogContentText>
    
                        <Stack direction='column' spacing={2}>
                            <br />
                            <TextField label={'title'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleTitleChange(event)} value={this.state.transaction.title} />
                            <TextField label={'amount'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleAmountChange(event)} value={this.state.amountString} />
                            <TextField label={'category'} id="outlined-basic" variant="outlined" onChange={(event) => this.handleCategoryChange(event)} value={this.state.transaction.category} />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                label="date"
                                value={this.state.transaction.date}
                                onChange={(newDate) => this.handleDateChange(newDate)}
                                renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                            <TextField label='description' id="outlined-multiline-static" multiline rows={4}  onChange={(event) => this.handleDescriptionChange(event)} defaultValue={this.state.transaction.description} />
    
                        
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
