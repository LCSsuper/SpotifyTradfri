import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react-lite";

import context from "../context";
import "./Config.css";

const Config = observer(({ history }) => {
    const {
        configStore: {
            tradfri: {
                securityCode,
                name,
                host,
                version,
                addresses,
                identity,
                psk
            },
            spotify: { clientId, clientSecret, redirectUri },
            initialize,
            save,
            generate,
            setSecurityCode,
            setClientId,
            setClientSecret,
            setRedirectUri
        }
    } = useContext(context);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initialize().then(() => {
            setLoading(false);
        });
    }, []);

    const gen = async () => {
        setLoading(true);
        await generate();
        setLoading(false);
    };

    return (
        <div id="config-container">
            <h3>Spotify</h3>
            <h5>
                These values can be generated by creating a Spotify developers
                account and creating an app there
            </h5>
            <input
                type="text"
                placeholder="Client ID"
                value={clientId}
                onChange={setClientId}
            />
            <input
                type="text"
                placeholder="Client secret"
                value={clientSecret}
                onChange={setClientSecret}
            />
            <input
                type="text"
                placeholder="Redirect URI"
                value={redirectUri}
                onChange={setRedirectUri}
            />
            <h3>Trådfri</h3>
            <h5>This value can be found on the back of the Trådfri gateway</h5>
            <input
                type="text"
                placeholder="Security Code"
                value={securityCode}
                onChange={setSecurityCode}
            />
            <h5 className="float-left">
                The following values are generated, make sure the server and the
                gateway are on the same network when generating
            </h5>
            <button onClick={gen}>
                {!loading ? (
                    <p>Generate values</p>
                ) : (
                    <div id="loader">
                        <div className="item"></div>
                        <div className="item"></div>
                        <div className="item"></div>
                        <div className="item"></div>
                    </div>
                )}
            </button>
            <input disabled type="text" placeholder="Name" value={name} />
            <input disabled type="text" placeholder="Host" value={host} />
            <input disabled type="text" placeholder="Version" value={version} />
            <input
                disabled
                type="text"
                placeholder="Adress 1"
                value={addresses[0]}
            />
            <input
                disabled
                type="text"
                placeholder="Adress 2"
                value={addresses[1]}
            />
            <input disabled type="text" placeholder="ID" value={identity} />
            <input disabled type="text" placeholder="PSK" value={psk} />
            <button
                onClick={() => {
                    save(history);
                }}
            >
                Save
            </button>
            <Link id="cancel" to="/">
                Cancel
            </Link>
        </div>
    );
});

export default Config;
