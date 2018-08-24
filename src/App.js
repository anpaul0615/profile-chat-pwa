import React, {Component} from 'react';
import './App.css';
import ChatHeader from './components/ChatHeader';
import ChatBody from './components/ChatBody';
import Login from './components/Login';

import CognitoClient from './lib/cognito-client';
import MQTTClient from './lib/mqtt-client';

class App extends Component {
    constructor(){
        super();
        this.inputFetchingTimer = null;
        this.state = {
            isAuthenticated: false,
            hasNoAccount: false,
            login: {
                email: '',
                password: '',
            },
            signup: {
                email: '',
                password: '',
                password2: '',
            },
            auth: {
                accessKeyId: '',
                secretKey: '',
                sessionToken: ''
            },
            messages: [
                {
                    user: 'paul',
                    content: 'aaa',
                    timestamp: 'yyyy-mm-dd hh:mm:ss'
                },
                {
                    user: 'guest',
                    content: 'bbb',
                    timestamp: 'yyyy-mm-dd hh:mm:ss'
                },
                {
                    user: 'guest',
                    content: 'ccc',
                    timestamp: 'yyyy-mm-dd hh:mm:ss'
                },
                {
                    user: 'paul',
                    content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
                    timestamp: 'yyyy-mm-dd hh:mm:ss'
                },
                {
                    user: 'guest',
                    content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
                    timestamp: 'yyyy-mm-dd hh:mm:ss'
                }
            ]
        };
    }
    handleClickExitButton = ()=>{
        console.log('handleClickExitButton is called..!');
        window.parent.postMessage('chat-off','*');
    }
    handleChangeInputText = (event)=>{
        console.log('handleChangeInputText is called..!');
        console.log(event.target.value);
        // alert('change!');
    }
    handleClickMessageSendButton = ()=>{
        console.log('handleClickMessageSendButton is called..!');
        alert('click!');
    }

    /* Login Functions */
    handleInputLoginEmail = (event)=>{
        //console.log('handleInputLoginEmail is called..!');
        const email = event.target.value;
        this.setState({
            ...this.state,
            login: {
                ...this.state.login,
                email
            }
        });
    }
    handleInputLoginPassword = (event)=>{
        //console.log('handleInputLoginPassword is called..!');
        const password = event.target.value;
        this.setState({
            ...this.state,
            login: {
                ...this.state.login,
                password
            }
        });
    }
    handleClickLoginButton = async ()=>{
        try {
            // Get Cognito Credentials
            const { email, password } = this.state.login;
            const cognitoClient = new CognitoClient();
            const cognitoCredentials = await cognitoClient.getCredentials(email,password);
            // Update Cognito Credentials To App State
            this.setState({
                ...this.state,
                auth: {
                    accessKeyId: cognitoCredentials.accessKeyId,
                    secretAccessKey: cognitoCredentials.secretAccessKey,
                    sessionToken: cognitoCredentials.sessionToken
                }
            });
            // Init MQTT Connection
            console.log(cognitoCredentials);
            const mqttClient = new MQTTClient(email, cognitoCredentials);
            mqttClient.subscribe(email);
            // Update Login State
            this.setState({
                ...this.state,
                isAuthenticated: true
            });
        } catch(e) {
            alert(e.message || e);
        }
    }
    handleClickGoToSignupButton = ()=>{
        console.log('handleClickGoToSignupButton is called..!');
        this.setState({
            ...this.state,
            hasNoAccount: true
        });
    }

    /* Signup Functions */
    handleInputSignupEmail = (event)=>{
        console.log('handleInputSignupEmail is called..!');
        const email = event.target.value;
        this.setState({
            ...this.state,
            signup: {
                ...this.state.signup,
                email
            }
        });
    }
    handleInputSignupPassword = (event)=>{
        console.log('handleInputSignupPassword is called..!');
        const password = event.target.value;
        this.setState({
            ...this.state,
            signup: {
                ...this.state.signup,
                password
            }
        });
    }
    handleInputSignupPasswordAgain = (event)=>{
        console.log('handleInputSignupPasswordAgain is called..!');
        const password2 = event.target.value;
        this.setState({
            ...this.state,
            signup: {
                ...this.state.signup,
                password2
            }
        });
    }
    handleClickSignupButton = async ()=>{
        console.log('handleClickSignupButton is called..!');
    }
    handleClickGoToLoginButton = ()=>{
        console.log('handleClickGoToLoginButton is called..!');
        this.setState({
            ...this.state,
            hasNoAccount: false
        });
    }

    render() {
        const { isAuthenticated, hasNoAccount } = this.state;
        return (
            <div className="App">
                {
                    isAuthenticated
                    ? null
                    : <Login
                        key={'Login'}
                        hasNoAccount={hasNoAccount}
                        handleInputLoginEmail={this.handleInputLoginEmail}
                        handleInputLoginPassword={this.handleInputLoginPassword}
                        handleClickLoginButton={this.handleClickLoginButton}
                        handleClickGoToSignupButton={this.handleClickGoToSignupButton}
                        handleInputSignupEmail={this.handleInputSignupEmail}
                        handleInputSignupPassword={this.handleInputSignupPassword}
                        handleInputSignupPasswordAgain={this.handleInputSignupPasswordAgain}
                        handleClickSignupButton={this.handleClickSignupButton}
                        handleClickGoToLoginButton={this.handleClickGoToLoginButton} />
                }
                <ChatHeader
                    key={'ChatHeader'}
                    handleClickExitButton={this.handleClickExitButton} />
                <ChatBody
                    key={'ChatBody'}
                    messages={this.state.messages}
                    handleChangeInputText={this.handleChangeInputText}
                    handleClickMessageSendButton={this.handleClickMessageSendButton} />
            </div>
        );
    }
}

export default App;
