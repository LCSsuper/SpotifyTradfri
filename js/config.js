/**
 * Created by lcssuper on 08-11-18.
 */

const Http = new XMLHttpRequest();
const IDPSKHttp = new XMLHttpRequest();

function save() {

    let name = document.getElementById('name').value;
    let host = document.getElementById('host').value;
    let version = document.getElementById('version').value;
    let address1 = document.getElementById('address1').value;
    let address2 = document.getElementById('address2').value;
    let identity = document.getElementById('identity').value;
    let psk = document.getElementById('psk').value;
    let securityCode = document.getElementById('securityCode').value;

    let clientId = document.getElementById('ClientId').value;
    let clientSecret = document.getElementById('clientSecret').value;
    let redirectUri = document.getElementById('redirectUri').value;
    let accesstoken = document.getElementById('accesstoken').value;

    let json = {
        tradfri: {
            name: name,
            host: host,
            version: version,
            addresses: [
                address1,
                address2
            ],
            identity: identity,
            psk: psk,
            securityCode: securityCode
        },
        spotify: {
            clientId: clientId,
            clientSecret: clientSecret,
            redirectUri: redirectUri,
            accessToken: accesstoken
        }
    };

    Http.open("GET", "/save?json=" + JSON.stringify(json));
    Http.send();

    window.location = '/';
}

function cancel() {
    window.location = '/';
}

function getIDandPSK() {
    let name = document.getElementById('name').value;

    IDPSKHttp.open("GET", '/IDandPSK/' + name);
    IDPSKHttp.send();
    IDPSKHttp.onreadystatechange = e => {
        let res = Http.responseText;

        if (res !== null && res !== "") {
            //TODO: fill identity field and PSK field

            document.getElementById('identity').value = "";
            document.getElementById('psk').value = "";
        }
    };

}