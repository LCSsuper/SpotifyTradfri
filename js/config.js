/**
 * Created by lcssuper on 08-11-18.
 */

const name = document.getElementById('name');
const host = document.getElementById('host');
const version = document.getElementById('version');
const address1 = document.getElementById('address1');
const address2 = document.getElementById('address2');
const identity = document.getElementById('identity');
const psk = document.getElementById('psk');
const securityCode = document.getElementById('securityCode');

const clientId = document.getElementById('ClientId');
const clientSecret = document.getElementById('clientSecret');
const redirectUri = document.getElementById('redirectUri');

const buttonText = document.getElementById('buttonText');
const loader = document.getElementById('loader');

window.onload = function() {
    getConfig();
};

function getConfig() {
    fetch("/getConfig")
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            name.value = json.tradfri.name;
            host.value = json.tradfri.host;
            version.value = json.tradfri.version;
            address1.value = json.tradfri.addresses[0];
            address2.value = json.tradfri.addresses[1];
            identity.value = json.tradfri.identity;
            psk.value = json.tradfri.psk;
            securityCode.value = json.tradfri.securityCode;

            clientId.value = json.spotify.clientId;
            clientSecret.value = json.spotify.clientSecret;
            redirectUri.value = json.spotify.redirectUri;
        });
}

function save() {

    let json = {
        tradfri: {
            name: name.value,
            host: host.value,
            version: version.value,
            addresses: [
                address1.value,
                address2.value
            ],
            identity: identity.value,
            psk: psk.value,
            securityCode: securityCode.value
        },
        spotify: {
            clientId: clientId.value,
            clientSecret: clientSecret.value,
            redirectUri: redirectUri.value
        }
    };

    fetch("/save?json=" + JSON.stringify(json));

    window.location = '/';
}

function cancel() {
    window.location = '/';
}

function getIDandPSK() {
    let nameValue = name.value;

    if (nameValue === '') {
        name.placeholder = 'Please fill in the official name before generating ID and PSK';
        setTimeout(() => name.placeholder = 'Name', 5000);
    } else {
        buttonText.style.display = 'none';
        loader.style.display = 'block';

        //TODO: check if works with real name
        fetch('/IDandPSK/' + nameValue)
            .then(response => {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json().then(data => {
                        identity.value = data.identity;
                        psk.value = data.psk;
                    });
                }
            })
            .then(() => {
                buttonText.style.display = 'block';
                loader.style.display = 'none';
            });
    }
}