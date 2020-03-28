// React
import React, { Component } from 'react';

import LineChart from 'react-linechart';
import '../../node_modules/react-linechart/dist/styles.css';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';
import { Auth } from 'aws-amplify';

// graphql
import { listTransactions } from '../graphql/queries';
import { createTransaction } from '../graphql/mutations';

import { getDoubleDigitFormat, convertDateStrToGraphqlDate } from '../common/Utilities';

API.configure(awsconfig);
PubSub.configure(awsconfig);

class About extends Component {
    constructor(props) {
        super(props);
    }


    render() {

        return (

            <div className="indent">
                <h2><b>About</b></h2>
                <p>For bugs, feature requests, or questions please email <b>zenspending@gmail.com</b></p>
            </div>
        );
    }
}

export default About;
