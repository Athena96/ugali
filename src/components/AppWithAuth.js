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


// export { default as Authenticator } from './Authenticator';
// export { default as AuthPiece } from './AuthPiece';
// export { default as SignIn } from './SignIn';
// export { default as ConfirmSignIn } from './ConfirmSignIn';
// export { default as SignOut } from './SignOut';
// export { default as RequireNewPassword } from './RequireNewPassword';
// export { default as SignUp } from './SignUp';
// export { default as ConfirmSignUp } from './ConfirmSignUp';
// export { default as VerifyContact } from './VerifyContact';
// export { default as ForgotPassword } from './ForgotPassword';
// export { default as Greetings } from './Greetings';
// export { default as FederatedSignIn, FederatedButtons, } from './FederatedSignIn';
// export { default as TOTPSetup } from './TOTPSetup';
// export { default as Loading } from './Loading';

export default AppWithAuth