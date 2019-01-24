import React, { Component } from 'react';
import './Playing.css';
import ColorThief from 'color-thief';
import hexSorter from 'hexsorter';
class Playing extends Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            artist: "",
            album: "",
            albumCover: "",
            hex: ""
        }
    }

    componentDidMount() {
        this.getCurrentlyPlaying();

        setInterval(() => {
            this.getCurrentlyPlaying();
        }, 1000);
    }

    render() {
        return (
            <div id="container">
                <div id="album-cover-container">
                    <img id="album-cover" src={this.state.albumCover} alt="" />
                </div>
                <div id="details-container">
                    <h1 id="title">{this.state.title ? this.state.title : "Nothing currently playing"}</h1>
                    <p id="artist">{this.state.artist}</p>
                    <p id="album">{this.state.album}</p>
                </div>
            </div>
        );
    }

    getCurrentlyPlaying() {
        let self = this;

        fetch("http://localhost:8080/getCurrentlyPlaying")
            .then(response => {
                return response.json();
            })
            .then(json => {
                self.setState({
                    title: json.title,
                    artist: json.artist,
                    album: json.album,
                    albumCover: "data:image/jpeg;base64, " + json.albumCover
                });

                let colorThief = new ColorThief();
                let imageEl = document.getElementById('album-cover');
                try {
                    let colors = colorThief.getPalette(imageEl, 8);

                    console.log(colors);

                    for (let i = 0; i < colors.length; i++) {
                        colors[i] = '#' + self.rgbToHex(colors[i][0], colors[i][1], colors[i][2]);
                    }

                    let color = hexSorter.mostSaturatedColor(colors);

                    console.log(color);

                    self.setAndSendColor(color);

                } catch (e) {}
            })
    }

    setAndSendColor(hex) {
        let body = document.getElementsByTagName('body')[0];

        if (this.state.hex !== hex) {
            fetch('http://localhost:8080/color/' + hex.split("#")[1]);

            body.style.background = "linear-gradient(to bottom, " + hex + ", " + hex + ", #191414)";

            this.setState({
                hex: hex
            });
        }
    }

    decToHex(decimal) {
        let hex = decimal.toString('16');
        return hex.length === 1 ? '0' + hex : hex;
    }

    rgbToHex(r, g, b) {
        return this.decToHex(r) + this.decToHex(g) + this.decToHex(b);
    }
}

export default Playing;
