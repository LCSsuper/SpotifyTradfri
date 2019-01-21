let fs = require('fs'),
    tradfri = require("node-tradfri-client");

const configuration = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const client = new tradfri.TradfriClient(configuration.tradfri.name);

let auth = async () => {
    try {
        const data = await client.authenticate(configuration.tradfri.securityCode);
        console.log(data);
    } catch (e) {
        console.log("Something went wrong...");
    }
};

auth();