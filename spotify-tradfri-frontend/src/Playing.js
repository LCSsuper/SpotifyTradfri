import React, { Component } from 'react';
import './Playing.css';

class Playing extends Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            artist: "",
            album: "",
            albumCover: ""
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <div id="container">
                <div id="album-cover-container">
                    <img id="album-cover" src={this.state.albumCover} alt="" />
                </div>
                <div id="details-container">
                    <h1 id="title">{this.state.title}</h1>
                    <p id="artist">{this.state.artist}</p>
                    <p id="album">{this.state.album}</p>
                </div>
            </div>
        );
    }

    getCurrentlyPlaying() {
        fetch("http://localhost:8080/getCurrentlyPlaying")
            .then(function(response) {
                //TODO: do something with the data
            })
    }
}

export default Playing;
