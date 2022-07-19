import { FC } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { CategoryDirectory } from '../utilities/transactionUtils';
import Typography from '@mui/material/Typography';
import { ALL } from '../utilities/helpers';

interface BudgetComponentProps {
    year: number;
    month: number;
    category: CategoryDirectory;
    percentSpent: number;
    isOverBudget: boolean;
    isMaster?: boolean;
}

const BudgetComponent: FC<BudgetComponentProps> = ({ year,
    month,
    category,
    percentSpent,
    isOverBudget, isMaster=false}) => {
    const leftToSpend = (category.budgetCategory!.value - category.sum)
    const leftOrOverMsg = isOverBudget ? "over" : "left";
    const title = isMaster ? <b>{category.name}</b> : <>{category.name}</>
    return (
        <Link style={{ color: 'black', textDecoration: 'none' }} to={`/transactions/${year}/${month}/${isMaster ? ALL : category.name}`}>
        <Box sx={{marginTop: '30px', '&:hover': {
            backgroundColor: 'lightgray',
            opacity: [0.9, 0.8, 0.7],
          },}}>
            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                <Box sx={{ width: '100%', mr: 1, color: isOverBudget ? 'red' : 'green', }}>
                 <Typography style={{ float: 'left'}} variant="body1" color={ "text.primary"} >{title}</Typography>
                    <Typography style={{ float: 'right'}} variant="body2" color={ "text.secondary"}>{`$${leftToSpend.toFixed(2)} ${leftOrOverMsg}`}</Typography>
                    <LinearProgress style={{ width: '100%'}}color="inherit" variant="determinate" value={percentSpent} />
                </Box>
            </Box>
            <p>${category.sum.toFixed(2)} of ${category.budgetCategory!.value.toFixed(2)}</p>

        </Box>
        </Link>
    );
};

export default BudgetComponent;