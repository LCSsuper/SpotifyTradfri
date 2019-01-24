import React, { Component } from 'react';
import './Config.css';
import { Link } from 'react-router-dom';

class Config extends Component {

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

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleHostChange = this.handleHostChange.bind(this);
        this.handleVersionChange = this.handleVersionChange.bind(this);
        this.handleAddress1Change = this.handleAddress1Change.bind(this);
        this.handleAddress2Change = this.handleAddress2Change.bind(this);
        this.handleSecurityCodeChange = this.handleSecurityCodeChange.bind(this);
        this.handleClientIDChange = this.handleClientIDChange.bind(this);
        this.handleClientSecretChange = this.handleClientSecretChange.bind(this);
        this.handleRedirectURIChange = this.handleRedirectURIChange.bind(this);

        this.save = this.save.bind(this);
        this.getIDandPSK = this.getIDandPSK.bind(this);
    }

    render() {
        return (
            <div id="container">
                <h3>Trådfri</h3>
                <input type="text" id="name" placeholder="Name" value={this.state.tradfri.name} onChange={this.handleNameChange} />
                <button id="generate" onClick={this.getIDandPSK}>
                    {!this.state.loading ? <p id="buttonText">Generate ID and PSK</p> : ""}
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
                <input type="text" id="host" placeholder="Host" value={this.state.tradfri.host} onChange={this.handleHostChange} />
                <input type="text" id="version" placeholder="Version" value={this.state.tradfri.version} onChange={this.handleVersionChange} />
                <input type="text" id="address1" placeholder="Adress 1" value={this.state.tradfri.addresses[0]} onChange={this.handleAddress1Change} />
                <input type="text" id="address2" placeholder="Adress 2" value={this.state.tradfri.addresses[1]} onChange={this.handleAddress2Change} />
                <input disabled type="text" id="identity" placeholder="ID" value={this.state.tradfri.identity} />
                <input disabled type="text" id="psk" placeholder="PSK" value={this.state.tradfri.psk} />
                <input type="text" id="securityCode" placeholder="Security Code" value={this.state.tradfri.securityCode} onChange={this.handleSecurityCodeChange}/>
                <h3>Spotify</h3>
                <input type="text" id="ClientId" placeholder="Client ID" value={this.state.spotify.clientId} onChange={this.handleClientIDChange} />
                <input type="text" id="clientSecret" placeholder="Client secret" value={this.state.spotify.clientSecret} onChange={this.handleClientSecretChange} />
                <input type="text" id="redirectUri" placeholder="Redirect URI" value={this.state.spotify.redirectUri} onChange={this.handleRedirectURIChange} />
                <button onClick={this.save}>Save</button>
                <Link id="cancel" to="/">Cancel</Link>
            </div>
        );
    }

    componentDidMount() {
        this.getConfig();
    }

    save() {
        fetch("http://localhost:8080/save?json=" + JSON.stringify(this.state));

        this.props.history.push('/');
    }

    getIDandPSK() {
        if (this.state.tradfri.name === '') {
            this.setState({placeholder: 'Please fill in the official name before generating ID and PSK'});
            setTimeout(() => this.setState({placeholder: 'Name'}), 5000)
        } else {
            this.setState({loading: true});

            //TODO: check if works with real name
            fetch('http://localhost:8080/IDandPSK/' + this.state.tradfri.name)
                .then(response => {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json().then(data => {
                            let tradfri = this.state.tradfri;
                            tradfri.identity = data.identity;
                            tradfri.psk = data.psk;
                            this.setState({tradfri: tradfri});
                        });
                    }
                })
                .then(() => {
                    this.setState({loading: false});
                });
        }
    }

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

    handleNameChange(e) {
        let tradfri = this.state.tradfri;
        tradfri.name = e.target.value;
        this.setState({tradfri: tradfri});
    }

    handleHostChange(e) {
        let tradfri = this.state.tradfri;
        tradfri.host = e.target.value;
        this.setState({tradfri: tradfri});
    }

    handleVersionChange(e) {
        let tradfri = this.state.tradfri;
        tradfri.version = e.target.value;
        this.setState({tradfri: tradfri});
    }

    handleAddress1Change(e) {
        let tradfri = this.state.tradfri;
        tradfri.addresses[0] = e.target.value;
        this.setState({tradfri: tradfri});
    }

    handleAddress2Change(e) {
        let tradfri = this.state.tradfri;
        tradfri.addresses[1] = e.target.value;
        this.setState({tradfri: tradfri});
    }

    handleSecurityCodeChange(e) {
        let tradfri = this.state.tradfri;
        tradfri.securityCode = e.target.value;
        this.setState({tradfri: tradfri});
    }

    handleClientIDChange(e) {
        let spotify = this.state.spotify;
        spotify.clientId = e.target.value;
        this.setState({spotify: spotify});
    }

    handleClientSecretChange(e) {
        let spotify = this.state.spotify;
        spotify.clientSecret = e.target.value;
        this.setState({spotify: spotify});
    }

    handleRedirectURIChange(e) {
        let spotify = this.state.spotify;
        spotify.redirectUri = e.target.value;
        this.setState({spotify: spotify});
    }
}

export default Config;
