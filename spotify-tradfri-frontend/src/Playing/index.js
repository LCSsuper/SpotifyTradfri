import React, { useState, useEffect } from 'react';
import './Playing.css';
import ColorThief from 'color-thief';
import hexSorter from 'hexsorter';

const decToHex = decimal => {
    let hex = decimal.toString('16');
    return hex.length === 1 ? '0' + hex : hex;
}

const rgbToHex = (r, g, b) => {
    return decToHex(r) + decToHex(g) + decToHex(b);
}

const setAndSendColor = ({ color, hex, setHex }) => {
    let cover = document.getElementById('album-cover');

    if (hex !== color) {
        fetch('http://localhost:8080/tradfri/color/' + color.split("#")[1]);

        cover.style.boxShadow = "1px 1px 150px " + color;

        setHex(color);
    }
}

const getCurrentlyPlaying = ({ hex, setTitle, setArtist, setAlbum, setAlbumCover, setHex }) => {
    const colorThief = new ColorThief();
    const imageEl = document.getElementById('album-cover');

    try {
        let colors = colorThief.getPalette(imageEl, 8);

        for (let i = 0; i < colors.length; i++) {
            colors[i] = '#' + rgbToHex(colors[i][0], colors[i][1], colors[i][2]);
        }

        let color = hexSorter.mostSaturatedColor(colors);

        setAndSendColor({ color, hex, setHex });
    } catch (e) {}

    fetch("http://localhost:8080/spotify/playing")
        .then(response => response.json())
        .then(json => {
            setTitle(json.title);
            setArtist(json.artist);
            setAlbum(json.album);
            setAlbumCover(`data:image/jpeg;base64, ${json.cover}`);
        })
}

const Playing = () => {

    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [albumCover, setAlbumCover] = useState('');
    const [hex, setHex] = useState('');

    useEffect(() => {
        getCurrentlyPlaying({ hex, setTitle, setArtist, setAlbum, setAlbumCover, setHex });

        const intervalId = setInterval(() => {
            getCurrentlyPlaying({ hex, setTitle, setArtist, setAlbum, setAlbumCover, setHex });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    return (
        <div id="container">
            <div id="album-cover-container">
                <img id="album-cover" src={albumCover} alt="" />
            </div>
            <div id="details-container">
                <h1 id="title">{title || 'Nothing currently playing'}</h1>
                <p id="artist">{artist} - {album}</p>
            </div>
        </div>
    );
}

export default Playing;
