import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import context from "../context";
import "./Home.css";

const Home = ({ location: { search }, history }) => {
    const {
        homeStore: { initialize, connect }
    } = useContext(context);

    useEffect(() => {
        initialize(search || '', history);
    }, []);

    return (
        <div className="container">
            <h1>Spotify - Trådfri</h1>
            <p>
                This application connects Spotify to the IKEA Trådfri lights.
                The color of the Trådfri lights get set to the average color of
                the album that's currently being played.
            </p>

            <p>
                If this is your first time using this application, you'll need
                to enter some IDs and tokens. You can do this here:{" "}
            </p>
            <Link to="/config">
                <div className="button" id="configure">
                    Configure
                </div>
            </Link>
            <p>
                When all the data is configured you can connect with your
                Spotify account:
            </p>
            <div className="button" id="spotify" onClick={connect}>
                <img alt="" src="spotify-white.png" />
                Connect with Spotify
            </div>
        </div>
    );
};

export default Home;
