import * as React from 'react';
import { salmonRed } from '../utilities/constants';

interface SignInViewProps {

}

interface IState {

}
 
class SignInView extends React.Component<SignInViewProps, IState> {
    constructor(props: SignInViewProps) {
        super(props);
        this.state = {}
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    async componentDidMount() {
    }

    render() {
        return (
            <div style={{ textAlign: "center" }}>
                <h1 style={{ color: salmonRed }}>Money Today</h1>
                <h3 style={{ color: "grey" }}>Measure where your money went,
so you can <b>decide</b> where it's going 💸</h3>
                <br />
            </div>
        );
    }
}

export default SignInView;