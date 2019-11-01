import React, { useEffect, useContext } from "react";
import { observer } from "mobx-react-lite";

import context from "../context";
import "./Playing.css";

const Playing = observer(() => {
    const {
        playingStore: { title, artist, album, cover, initialize, cleanup }
    } = useContext(context);

    useEffect(() => {
        initialize();

        return () => {
            cleanup();
        };
    }, []);

    return (
        <div id="container">
            <div id="album-cover-container">
                <img id="album-cover" src={cover} alt="" />
            </div>
            <div id="details-container">
                <h1 id="title">{title || "Nothing currently playing"}</h1>
                <p id="artist">
                    {artist} - {album}
                </p>
            </div>
        </div>
    );
});

export default Playing;
