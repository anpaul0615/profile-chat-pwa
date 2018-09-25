import React, {Component} from 'react';
import './App.css';
import ChatHeader from './components/ChatHeader';
import ChatBody from './components/ChatBody';
import ChatSignature from './components/ChatSignature';

import CognitoClient from './lib/cognito-client';
import MQTTClient from './lib/mqtt-client';
import PolicyManager from './lib/policy-manager';
import APIGatewayClient from './lib/apigateway-client';

class App extends Component {
    constructor(){
        super();
        this.apigwClient = new APIGatewayClient();
        this.cognitoClient = new CognitoClient();
        this.inputFetchingTimer = null;
        this.state = {
            isAuthenticated: false,
            hasNoAccount: false,
            signin: {
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
            messages: []
        };
    }

    /* Signout Functions */
    handleClickExitButton = ()=>{
        console.log('handleClickExitButton is called..!');
        // Confirm Signout
        if ( !window.confirm('Signout Now?') ) {
            return;
        }
        // Signout Cognito Connection
        this.cognitoClient.signout();
        // Disconnect MQTT Connection
        this.mqttClient.disconnect();
        // Clear All States
        this.setState({
            ...this.state,
            isAuthenticated: false,
            hasNoAccount: false,
            signin: {
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
            messages: []
        });
        // Close Iframe Window
        window.parent.postMessage('chat-off','*');
    }

    /* Messaging Functions */
    handleChangeInputText = (event)=>{
        console.log('handleChangeInputText is called..!');
        console.log(event.target.value);
        // alert('change!');
    }
    handleClickMessageSendButton = ()=>{
        console.log('handleClickMessageSendButton is called..!');
        alert('click!');
    }

    /* Signin Functions */
    handleInputSigninEmail = (event)=>{
        //console.log('handleInputSigninEmail is called..!');
        const email = event.target.value;
        this.setState({
            ...this.state,
            signin: {
                ...this.state.signin,
                email
            }
        });
    }
    handleInputSigninPassword = (event)=>{
        //console.log('handleInputSigninPassword is called..!');
        const password = event.target.value;
        this.setState({
            ...this.state,
            signin: {
                ...this.state.signin,
                password
            }
        });
    }
    handleClickSigninButton = async ()=>{
        try {
            // Get Cognito Credentials
            const { email, password } = this.state.signin;
            const cognitoCredentials = await this.cognitoClient.getCredentials(email,password);
            // Update Cognito Credentials To App State
            this.setState({
                ...this.state,
                auth: {
                    accessKeyId: cognitoCredentials.accessKeyId,
                    secretAccessKey: cognitoCredentials.secretAccessKey,
                    sessionToken: cognitoCredentials.sessionToken
                }
            });
            // Attach Principal Policy
            const { identityId } = cognitoCredentials;
            const policyManager = new PolicyManager();
            await policyManager.attachUserIdentityToPolicy('iot-chat-policy', identityId);
            // Init MQTT Connection
            this.mqttClient = new MQTTClient(email, cognitoCredentials);
            this.mqttClient.subscribe(email);

            // Check Message Group
            await this.apigwClient.invokeAPIGateway({
                path: '/messages/group',
                method: 'GET',
                queryParams: { groupname: email }
            })
            .catch(e=>
                this.apigwClient.invokeAPIGateway({
                    path: '/messages/group',
                    method: 'POST',
                    body: {
                        groupname: email,
                        userList: [ email, 'anpaul0615@gmail.com' ]
                    }
                }).catch(e=>e)
            );

            // Get All Message History
            const { data:messageHistory } = await this.apigwClient.invokeAPIGateway({
                path: '/messages',
                method: 'GET',
                queryParams: { groupname: email, startDate: '1000-01-01T00:00:00.000Z' }
            }).catch(e=>e);

            // Parse Message History
            const messages = (messageHistory || []).map(e=>({
                user: e.username === 'anpaul0615@gmail.com' ? 'paul' : e.username,
                content: e.content,
                timestamp: e.regdate,
            }));

            // Update Signin State & Message History
            this.setState({
                ...this.state,
                messages,
                isAuthenticated: true
            });
        } catch(e) {
            // console.log(e);
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

        // Check Validation
        const { email, password, password2 } = this.state.signup;
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
            return alert('Email Format is Invalid..!');
        }
        if (password !== password2) {
            return alert('Password Confirm is not matched..!');
        }

        // Register New Account
        try {
            // Get Cognito Credentials
            const result = await this.cognitoClient.registerNewAccount(email,password);
            console.log(result);
            // Notify Success to User
            alert('Confirmation code was sent to your email!!');
            // Reset Signup Data
            this.setState({
                ...this.state,
                hasNoAccount: false,
                signup: {
                    email: '',
                    password: '',
                    password2: ''
                }
            });

        } catch(e) {
            alert(e.message || e);
        }
    }
    handleClickGoToSigninButton = ()=>{
        console.log('handleClickGoToSigninButton is called..!');
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
                    : <ChatSignature
                        key={'ChatSignature'}
                        hasNoAccount={hasNoAccount}
                        handleInputSigninEmail={this.handleInputSigninEmail}
                        handleInputSigninPassword={this.handleInputSigninPassword}
                        handleClickSigninButton={this.handleClickSigninButton}
                        handleClickGoToSignupButton={this.handleClickGoToSignupButton}
                        handleInputSignupEmail={this.handleInputSignupEmail}
                        handleInputSignupPassword={this.handleInputSignupPassword}
                        handleInputSignupPasswordAgain={this.handleInputSignupPasswordAgain}
                        handleClickSignupButton={this.handleClickSignupButton}
                        handleClickGoToSigninButton={this.handleClickGoToSigninButton} />
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
