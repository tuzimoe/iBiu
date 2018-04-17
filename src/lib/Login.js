import React, {Component} from 'react';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';
import { login, Me } from './Util';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

export class Input extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || ""
        }
    };

    onChangeHandler(proxy) {
        this.setState({value: proxy.target.value});
    }

    render() { return (
        <input style={{
            width: "60%",
            margin: "1em auto",
            marginTop: 0,
            background: "rgba(0, 0, 0, 0.1)",
            padding: "20px 30px",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: 20,
        }}
        placeholder={this.props.name}
        type={this.props.password ? "password" : "email"}
        onChange={this.onChangeHandler.bind(this)}
        value={this.state.value}
        />
    )}
}

export class Login extends Component {
    state = {
        open: false,
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    login() {
        login({
            email: this._email.state.value,
            passwd: this._passwd.state.value,
        }, (state, data) => {
            if (state) {
                this.props.snack(`欢迎光临 ${Me.name} 喵~`);
                this.props.logined();
                this.handleClose();
            } else {
                this.props.snack(data);
            }
        });
    };

    render() {
        return (
        <div>
            <Dialog
            fullScreen
            open={this.state.open}
            onClose={this.handleClose}
            transition={Transition}
            className="login"
            >
                <img className="biuLogo" src="/icon.png" alt="biu" />
                <Input name="Email" ref={r => {this._email = r}} value={Me.email}/>
                <Input name="Password" password ref={r => {this._passwd = r}}/>
                <Button 
                    onClick={this.login.bind(this)}
                    color="primary"
                    aria-label="Login"
                    style={{
                            background: 'linear-gradient(to right, rgb(16, 53, 255) 0%, rgb(73, 73, 255) 100%)',
                            width: "60%",
                            boxShadow: "0 5px 25px rgba(0, 0, 0, 0.3)",
                            margin: "0 auto",
                            marginTop: "2em",
                            borderRadius: 60,
                            color: "white",
                            fontFamily: "'Ubuntu'",
                            fontSize: 18,
                            height: 60}}>
                    Login
                </Button>
            </Dialog>
        </div>
        );
    }
}