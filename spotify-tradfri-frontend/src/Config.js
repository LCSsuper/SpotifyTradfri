import React, { Component } from 'react';
import './Config.css';
import { Link } from 'react-router-dom';

/**
 * The configuration page
 */
class Config extends Component {

    /**
     * Initiates the state with all the variables
     * and binds all the functions that get called in the HTML
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            tradfri: {
                name: "",
                host: "",
                version: "",
                addresses: [
                    "",
                    ""
                ],
                identity: "",
                psk: "",
                securityCode: ""
            },
            spotify: {
                clientId: "",
                clientSecret: "",
                redirectUri: ""
            },
            placeholder: "Name",
            loading: false
        };

        this.handleSecurityCodeChange = this.handleSecurityCodeChange.bind(this);
        this.handleClientIDChange = this.handleClientIDChange.bind(this);
        this.handleClientSecretChange = this.handleClientSecretChange.bind(this);
        this.handleRedirectURIChange = this.handleRedirectURIChange.bind(this);

        this.save = this.save.bind(this);
        this.generateTradfriData = this.generateTradfriData.bind(this);
    }

    /**
     * Renders the HTML
     * @returns {XML}
     */
    render() {
        return (
            <div id="container">
                <h3>Spotify</h3>
                <h5>These values can be generated by creating a Spotify developers account and creating an app there</h5>
                <input type="text" id="ClientId" placeholder="Client ID" value={this.state.spotify.clientId} onChange={this.handleClientIDChange} />
                <input type="text" id="clientSecret" placeholder="Client secret" value={this.state.spotify.clientSecret} onChange={this.handleClientSecretChange} />
                <input type="text" id="redirectUri" placeholder="Redirect URI" value={this.state.spotify.redirectUri} onChange={this.handleRedirectURIChange} />
                <h3>Trådfri</h3>
                <h5>This value can be found on the back of the Trådfri gateway</h5>
                <input type="text" id="securityCode" placeholder="Security Code" value={this.state.tradfri.securityCode} onChange={this.handleSecurityCodeChange}/>
                <h5 className="float-left">The following values are generated, make sure the server and the gateway are on the same network when generating</h5>
                <button id="generate" onClick={this.generateTradfriData}>
                    {!this.state.loading ? <p id="buttonText">Generate values</p> : ""}
                    {
                        this.state.loading
                            ? <div id="loader">
                                <div className="item"></div>
                                <div className="item"></div>
                                <div className="item"></div>
                                <div className="item"></div>
                            </div> : ""
                    }
                </button>
                <input disabled type="text" id="name" placeholder="Name" value={this.state.tradfri.name} />
                <input disabled type="text" id="host" placeholder="Host" value={this.state.tradfri.host} />
                <input disabled type="text" id="version" placeholder="Version" value={this.state.tradfri.version} />
                <input disabled type="text" id="address1" placeholder="Adress 1" value={this.state.tradfri.addresses[0]} />
                <input disabled type="text" id="address2" placeholder="Adress 2" value={this.state.tradfri.addresses[1]} />
                <input disabled type="text" id="identity" placeholder="ID" value={this.state.tradfri.identity} />
                <input disabled type="text" id="psk" placeholder="PSK" value={this.state.tradfri.psk} />
                <button onClick={this.save}>Save</button>
                <Link id="cancel" to="/">Cancel</Link>
            </div>
        );
    }

    /**
     * Calls getConfig when the page is loaded
     */
    componentDidMount() {
        this.getConfig();
    }

    /**
     * Sends the configuration data to the back-end to get saved
     */
    save() {
        fetch("http://localhost:8080/save?json=" + JSON.stringify({tradfri: this.state.tradfri, spotify: this.state.spotify}));

        this.props.history.push('/');
    }

    /**
     * Sends the securitycode to the back-end,
     * then waits for the generated data
     * and fills the input fields when they are gotten
     */
    generateTradfriData() {
        if (this.state.tradfri.securityCode !== '') {
            this.setState({loading: true});

            fetch('http://localhost:8080/generateTradfriData/' + this.state.tradfri.securityCode)
                .then(response => {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json().then(data => {

                            if (data.data !== null) {
                                let tradfri = this.state.tradfri;
                                tradfri.name = data.result.name;
                                tradfri.host = data.result.host;
                                tradfri.version = data.result.version;
                                tradfri.addresses[0] = data.result.addresses[0];
                                tradfri.addresses[1] = data.result.addresses[1];
                                tradfri.identity = data.data.identity;
                                tradfri.psk = data.data.psk;
                                this.setState({tradfri: tradfri});
                            }
                        });
                    }
                })
                .then(() => {
                    this.setState({loading: false});
                });
        }
    }

    /**
     * Gets the config.json data from the back-end and pre-fills the input fields
     */
    getConfig() {
        let self = this;

        fetch("http://localhost:8080/getConfig")
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                self.setState({
                    tradfri: {
                        name: json.tradfri.name,
                        host: json.tradfri.host,
                        version: json.tradfri.version,
                        addresses: [
                            json.tradfri.addresses[0],
                            json.tradfri.addresses[1]
                        ],
                        identity: json.tradfri.identity,
                        psk: json.tradfri.psk,
                        securityCode: json.tradfri.securityCode
                    },
                    spotify: {
                        clientId: json.spotify.clientId,
                        clientSecret: json.spotify.clientSecret,
                        redirectUri: json.spotify.redirectUri
                    },
                });
            });
    }

    /**
     * Saves the security code value to the state when it changes
     * @param e
     */
    handleSecurityCodeChange(e) {
        let tradfri = this.state.tradfri;
        tradfri.securityCode = e.target.value;
        this.setState({tradfri: tradfri});
    }

    /**
     * Saves the client ID value to the state when it changes
     * @param e
     */
    handleClientIDChange(e) {
        let spotify = this.state.spotify;
        spotify.clientId = e.target.value;
        this.setState({spotify: spotify});
    }

    /**
     * Saves the client secret value to the state when it changes
     * @param e
     */
    handleClientSecretChange(e) {
        let spotify = this.state.spotify;
        spotify.clientSecret = e.target.value;
        this.setState({spotify: spotify});
    }

    /**
     * Saves the redirect URI value to the state when it changes
     * @param e
     */
    handleRedirectURIChange(e) {
        let spotify = this.state.spotify;
        spotify.redirectUri = e.target.value;
        this.setState({spotify: spotify});
    }
}

export default Config;
