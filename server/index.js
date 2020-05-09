const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const Spotify = require("./spotify");
const Tradfri = require("./tradfri");
const { get, save } = require("./utils/config");

const app = express();
const port = 8080;

const spotify = new Spotify();
const tradfri = new Tradfri();

app.use(cors());
app.use(bodyParser.json());
app.post("/tradfri/colors", ({ body }, res) => {
    const { colors } = body;
    tradfri.set_colors(colors);
    res.end();
});

app.get("/tradfri/generate/:security_code", async ({ params }, res) => {
    const { security_code } = params;
    const data = await tradfri.generate(security_code);
    res.send(data);
});

app.get("/spotify/authorize", async (req, res) => {
    const scopes = "user-read-private user-read-email user-read-playback-state";
    const configuration = await get();

    res.send(
        `https://accounts.spotify.com/authorize?response_type=code&client_id=${
            configuration.spotify.clientId
        }&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(
            configuration.spotify.redirectUri
        )}`
    );
});

app.get("/access/:token", async ({ params }, res) => {
    const { token } = params;
    const success = await tradfri.start();
    if (!success) console.error("Error: No Tradfri connection.");
    await spotify.initialize(token);
    res.end();
});

app.get("/config/save", async ({ query }, res) => {
    const { json } = query;
    save(json);
    res.end();
});

app.get("/config", async (req, res) => {
    let configuration;
    try {
        configuration = await get();
    } catch (e) {
        configuration = await get(true);
    }

    res.send(configuration);
});

app.get("/spotify/playing", async (req, res) => {
    res.send(await spotify.playing());
});

app.listen(port, () => {
    console.log(`Spotify Tradfri backend listening on ${port}!`);
});
