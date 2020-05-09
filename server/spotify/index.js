const SpotifyWebApi = require("spotify-web-api-node");

const { get } = require("../utils/config");
const { download } = require("../utils/download");
const { is_empty } = require("../utils/is_empty");
const { base64_encode } = require("../utils/base64_encode");

class Spotify {
    constructor() {
        this.initialized = false;
        this.api = null;
        this.response = {};
    }

    async initialize(token) {
        const { spotify } = await get();

        this.api = new SpotifyWebApi(spotify);

        let access_token = null;

        try {
            const {
                body,
                body: { refresh_token, expires_in }
            } = await this.api.authorizationCodeGrant(token);
            ({ access_token } = body);

            this.refresh(refresh_token, expires_in);
        } catch (e) {
            console.log(e);
        }

        if (!access_token) return false;
        this.api.setAccessToken(access_token);
        this.initialized = true;
        return true;
    }

    async refresh(token, expires) {
        this.api.setRefreshToken(token);
        try {
            setTimeout(async () => {
                const {
                    body: { access_token, expires_in, refresh_token }
                } = await this.api.refreshAccessToken();
                this.api.setAccessToken(access_token);
                this.refresh(refresh_token || token, expires_in);
            }, (expires - 60) * 1000);
        } catch (e) {
            console.error(e);
        }
    }

    async playing() {
        if (!this.initialized) return {};
        const { body } = await this.api.getMyCurrentPlaybackState({});

        if (is_empty(body)) {
            return {
                cover: null,
                album: null,
                title: null,
                artist: null,
                is_playing: false
            };
        }

        const {
            item: {
                id,
                name: title,
                artists: [{ name: artist }],
                album: {
                    name: album,
                    images: [{ url: cover }]
                }
            },
            is_playing
        } = body;

        if (this.response.id === id && this.response.is_playing === is_playing)
            return this.response;

        const filename = `album/${new Date().getTime()}.jpeg`;

        try {
            await download(cover, filename);
        } catch (e) {
            console.error(e);
        }

        this.response = {
            id,
            cover: await base64_encode(filename),
            album,
            title,
            artist,
            is_playing
        };

        return this.response;
    }
}

module.exports = Spotify;
