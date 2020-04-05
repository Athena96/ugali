import React from "react";
import { SignIn, SignOut } from "aws-amplify-react";
import config from "../aws-exports";
import { CustomSignIn } from "./CustomSignIn";
import App from "../App";
// import { Authenticator } from "../../aws-amplify-react/dist/Auth";
import { Authenticator } from 'aws-amplify-react';
import { withAuthenticator } from 'aws-amplify-react';

import { Greetings } from 'aws-amplify-react';


class AppWithAuth extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <Authenticator hide={[SignIn, Greetings]} amplifyConfig={config}>
          <CustomSignIn />
          <App />
        </Authenticator>
      </div>
    );
  }
}

export default AppWithAuth