import { decorate, action, observable, autorun } from "mobx";
import ColorThief from "color-thief";
import hexSorter from "hexsorter";
import request from "superagent";

const decToHex = decimal => {
    let hex = decimal.toString("16");
    return hex.length === 1 ? `0${hex}` : hex;
};

const rgbToHex = ([r, g, b]) => decToHex(r) + decToHex(g) + decToHex(b);

class PlayingStore {
    constructor() {
        this.title = "";
        this.artist = "";
        this.album = "";
        this.cover = "";
        this.hex = "";
        this.colors = [];
        this.is_playing = false;
        this.intervalId = null;
    }

    initialize = async () => {
        this.playing();

        this.intervalId = setInterval(() => {
            this.playing();
        }, 1000);

        autorun(this.getColor);
        autorun(this.setColor);
    };

    cleanup = () => {
        clearInterval(this.intervalId);
    };

    playing = async () => {
        const { title, artist, album, cover, is_playing } = await request
            .get("http://localhost:8080/spotify/playing")
            .then(res => res.body);

        this.title = title;
        this.artist = artist;
        this.album = album;
        this.cover = `data:image/jpeg;base64, ${cover}`;
        this.is_playing = is_playing;
    };

    getColor = () => {
        const colorThief = new ColorThief();
        const imageEl = document.getElementById("album-cover");
        imageEl.onload = () => {
            try {
                let colors = colorThief.getPalette(imageEl, 8);
                colors = colors.map(e => `#${rgbToHex(e)}`);
                this.colors = colors;
                this.hex = hexSorter.mostSaturatedColor(colors);
            } catch (e) {
                console.error(e);
            }
        };
    };

    setColor = async () => {
        const cover = document.getElementById("album-cover");
        await request
            .post(`http://localhost:8080/tradfri/colors`)
            .send({ colors: this.colors });

        cover.style.boxShadow = this.is_playing
            ? `1px 1px 100px ${this.hex}`
            : "";
    };
}

decorate(PlayingStore, {
    title: observable,
    artist: observable,
    album: observable,
    cover: observable,
    hex: observable,
    colors: observable,
    is_playing: observable,
    initialize: action,
    playing: action
});

export default new PlayingStore();
