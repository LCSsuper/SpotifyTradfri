import React, { useEffect, useContext } from "react";
import { observer } from "mobx-react-lite";

import context from "../context";
import "./Playing.css";

const Playing = observer(() => {
    const {
        playingStore: {
            title,
            artist,
            album,
            cover,
            is_playing,
            initialize,
            cleanup
        }
    } = useContext(context);

    useEffect(() => {
        initialize();
        return cleanup;
    }, []);

    return (
        <div id="playing-container">
            <div id="playing">
                <div id="album">
                    <img
                        id="album-cover"
                        src={cover}
                        alt=""
                        style={
                            !is_playing
                                ? {
                                      transform: "scale(.9)",
                                      filter: "grayscale(100%)"
                                  }
                                : {}
                        }
                    />
                </div>
                <h1 id="title">{title || "Nothing currently playing"}</h1>
                <p id="artist">
                    {artist} {artist && "-"} {album}
                </p>
            </div>
        </div>
    );
});

export default Playing;
