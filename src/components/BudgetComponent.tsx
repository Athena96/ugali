import { FC } from 'react';
import { Link } from 'react-router-dom';


import { CategoryDirectory } from '../utilities/transactionUtils';

import { ALL } from '../utilities/helpers';
import EditIcon from '@mui/icons-material/Edit';
import { Box, LinearProgress, Typography, Stack } from '@mui/material';

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
    isOverBudget, isMaster = false }) => {
    const leftToSpend = (category.budgetCategory!.value - category.sum)
    const leftOrOverMsg = isOverBudget ? "over" : "left";
    const title = isMaster ? <b>{category.name}</b> : <>{category.name}</>
    return (
        <Box >
            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                <Box sx={{ width: '100%', mr: 1, color: isOverBudget ? 'red' : 'green', }}>
                    <Stack direction='row' spacing={1}>


                        <Box sx={{ width: '90%' }}>

                            <Box sx={{

                                '&:hover': {
                                    backgroundColor: 'lightgray',
                                    opacity: [0.9, 0.8, 0.7],
                                },
                            }} >
                                <Link style={{ textDecorationColor: 'none', textDecoration: 'none' }} to={`/transactions/${year}/${month}/${isMaster ? ALL : category.name}`}>
                                    <Typography style={{ float: 'left' }} variant="body1" color={"text.primary"} >{title}</Typography>
                                </Link>
                            </Box>

                            <Typography style={{ float: 'right' }} variant="body2" color={"text.secondary"}>{`$${leftToSpend.toFixed(2)} ${leftOrOverMsg}`}</Typography>
                            <LinearProgress style={{ width: '100%' }} color="inherit" variant="determinate" value={percentSpent} />



                        </Box>
                        <Box style={{ width: '10%' }}>
                            <Link style={{ color: 'black', textDecoration: 'none' }} to={`/budget`}>
                                <EditIcon sx={{
                                    color: "text.secondary", '&:hover': {
                                        backgroundColor: 'lightgray',
                                        opacity: [0.9, 0.8, 0.7],
                                    },
                                }} />
                            </Link>
                        </Box>
                    </Stack>
                </Box>
            </Box>
            <p>${category.sum.toFixed(2)} of ${category.budgetCategory!.value.toFixed(2)}</p>

        </Box>

    );
};

export default BudgetComponent;