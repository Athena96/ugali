import React from "react";
import { SignIn } from "aws-amplify-react";
import '../App.css';
import Logo from "../assets/logo192.png"

export class CustomSignIn extends SignIn {
  constructor(props) {
    super(props);
    this._validAuthStates = ["signIn", "signedOut", "signedUp"];
  }

  showComponent(theme) {
    return (
      <div className="signIn">
        <div className="mx-auto w-full max-w-xs" style={{ backgroundColor: '#ff7b7b', borderRadius: "12px" }}>
          <div className="indent">
            <h1 style={{ color: 'white' }}>Zen Spending<img src={Logo} width="100" height="100"></img></h1>
             
            <h4 style={{ color: 'white' }}>Measure where your money went, <br/>so you can <b><i>decide</i></b> where it's going.</h4>
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label
                className="block text-grey-darker text-sm font-bold mb-2"
                htmlFor="username"
              >
                <b>Username</b>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%' }}
                id="username"
                key="username"
                name="username"
                onChange={this.handleInputChange}
                type="text"
                placeholder="Username"
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-grey-darker text-sm font-bold mb-2"
                htmlFor="password"
              >
                <b>Password</b>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker mb-3 leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%' }}
                id="password"
                key="password"
                name="password"
                onChange={this.handleInputChange}
                type="password"
                placeholder="******************"
              />
              <p className="text-grey-dark text-xs">
                Forgot your password?{" "}
                <a
                  className="text-indigo cursor-pointer hover:text-indigo-darker"
                  onClick={() => super.changeState("forgotPassword")}
                  style={{ color: 'blue' }}
                >
                  Reset Password
              </a>
              </p>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="login"
                type="button"
                onClick={() => super.signIn()}
                style={{ marginLeft: "6px", marginRight: "6px" }}
              >
                <h5>Login</h5>
              </button>

              <button
                className="create"
                type="button"
                onClick={() => super.changeState("signUp")}
                style={{ marginLeft: "6px", marginRight: "6px" }}
              >
                <h5>Create Account</h5>
              </button>

            </div>
          </form>
          </div>
        </div>
      </div>

    );
  }
}