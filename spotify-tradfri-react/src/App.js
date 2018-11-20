import React, {Component} from 'react';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.connectToSpotify = this.connectToSpotify.bind(this);

        this.state = {
            connected: false
        };
    }

    render() {
        return !this.state.connected ? this.connectPage() : this.playingPage();
    }

    connectPage() {
        return (
            <div className="container">
                <h1>Spotify - Trådfri</h1>
                <p>This application connects Spotify to the IKEA Trådfri lights. The color of the Trådfri lights get set
                    to the average color of the album that's currently being played.</p>
                <a onClick={this.connectToSpotify}>
                    <div id="button">
                        <img src="spotify-white.png"/>
                        &nbsp;Connect with Spotify
                    </div>
                </a>
            </div>
        );
    }

    playingPage() {
        return (
            <div>
                <div id="album-cover-container">
                    <img id="album-cover" src="" alt="" />
                </div>
                <div id="details-container">
                    <h1 id="title"></h1>
                    <p id="artist"></p>
                    <p id="album"></p>
                </div>
            </div>
        );
    }

    connectToSpotify() {
        this.setState({
            connected: true
        });
    }
    }

    export default App;
