import { decorate, action, observable } from "mobx";
import request from "superagent";

class ConfigStore {
    constructor() {
        this.tradfri = {
            name: "",
            host: "",
            version: "",
            addresses: ["", ""],
            identity: "",
            psk: "",
            securityCode: ""
        };

        this.spotify = {
            clientId: "",
            clientSecret: "",
            redirectUri: ""
        };
    }

    initialize = async () => {
        try {
            const { tradfri, spotify } = await request
                .get("http://localhost:8080/config")
                .then(res => res.body);

            this.tradfri = tradfri;
            this.spotify = spotify;
        } catch (e) {
            console.error(e);
            this.error = true;
        }
    };

    save = async history => {
        try {
            await request.get(
                `http://localhost:8080/config/save?json=${JSON.stringify({
                    tradfri: this.tradfri,
                    spotify: this.spotify
                })}`
            );

            history.push("/");
        } catch (e) {
            console.error(e);
            this.error = true;
        }
    };

    generate = async () => {
        if (!this.tradfri.securityCode) return;

        try {
            const { data, result } = await request
                .get(
                    `http://localhost:8080/tradfri/generate/${this.tradfri.securityCode}`
                )
                .then(res => res.body);

            if (!data || !result) return;

            this.tradfri = {
                ...this.tradfri,
                name: result.name,
                host: result.host,
                version: result.version,
                addresses: result.addresses,
                identity: data.identity,
                psk: data.psk
            };
        } catch (e) {
            console.error(e);
            this.error = true;
        }

        return;
    };

    setSecurityCode = ({ target: { value } }) => {
        this.tradfri.securityCode = value;
    };

    setClientId = ({ target: { value } }) => {
        this.spotify.clientId = value;
    };

    setClientSecret = ({ target: { value } }) => {
        this.spotify.clientSecret = value;
    };

    setRedirectUri = ({ target: { value } }) => {
        this.spotify.redirectUri = value;
    };
}

decorate(ConfigStore, {
    tradfri: observable,
    spotify: observable,
    initialize: action,
    generate: action,
    setSecurityCode: action,
    setClientId: action,
    setClientSecret: action,
    setRedirectUri: action
});

export default new ConfigStore();
