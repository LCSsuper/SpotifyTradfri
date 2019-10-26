import React, { Component } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

class Home extends Component {

    /**
     * Checks if the URI contains the query parameter 'code'
     * which indicates that the Spotify login has taken place
     * after which the playing page can be shown
     * @param props
     */
    constructor(props) {
        super(props);

        if (props.location.search.includes("?code")) {
            let token = props.location.search.split("?code=")[1];

            fetch("http://localhost:8080/access/" + token)
                .then(() => {
                    setTimeout(() => this.props.history.push('/playing'), 500);
                });
        }
    }

    /**
     * Renders the HTML
     * @returns {XML}
     */
    render() {
        return (
            <div className="container">
                <h1>Spotify - Trådfri</h1>
                <p>This application connects Spotify to the IKEA Trådfri lights. The color of the Trådfri lights get set to the average color of the album that's currently being played.</p>

                <p>If this is your first time using this application, you'll need to enter some IDs and tokens. You can do this here: </p>
                <Link to="/config">
                    <div className="button" id="configure">
                        Configure
                    </div>
                </Link>
                <p>When all the data is configured you can connect with your Spotify account:</p>
                <div className="button" id="spotify" onClick={this.connect}>
                    <img alt="" src="spotify-white.png"/>
                    Connect with Spotify
                </div>
            </div>
        );
    }

    /**
     * Gets the authentication link from the back-end and sends the user there
     */
    connect() {
        fetch("http://localhost:8080/spotify/authorize")
            .then(response => {
                return response.text();
            })
            .then(text => {
                window.location = text;
            });
    }
}

export default Home;
