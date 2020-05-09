const {
    discoverGateway,
    TradfriClient,
    AccessoryTypes
} = require("node-tradfri-client");
const faker = require("faker");

const { get } = require("../utils/config");

class Tradfri {
    constructor() {
        this.client = null;
        this.lightbulbs = [];
    }

    async generate(security_code) {
        const result = await discoverGateway();

        if (!result) {
            console.error("Tradfri: Failed to discover gateway!");
            return { data: null };
        }

        const {
            addresses: [address]
        } = result;

        const c = new TradfriClient(address);

        try {
            const data = await c.authenticate(security_code);
            return { result, data };
        } catch (e) {
            console.error("Tradfri: Failed to authenticate with address");
            console.error(e.message);
            return { data: null };
        }
    }

    async start() {
        const configuration = await get();

        try {
            if (!this.client) {
                this.client = new TradfriClient(
                    configuration.tradfri.addresses[0]
                );
            }

            if (
                await this.client.connect(
                    configuration.tradfri.identity,
                    configuration.tradfri.psk
                )
            ) {
                this.initialize();
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    initialize() {
        this.client
            .on("device updated", device => {
                this.updated(device, this.lightbulbs);
            })
            .on("device removed", device => {
                this.removed(device, this.lightbulbs);
            })
            .observeDevices();
    }

    updated(device, lightbulbs) {
        if (
            device.type === AccessoryTypes.lightbulb &&
            device.lightList[0].spectrum === "rgb"
        ) {
            if (lightbulbs.find(e => e.id === device.instanceId)) return;
            lightbulbs.push({
                id: device.instanceId,
                light: device.lightList[0]
            });
        }
    }

    removed(instanceId, lightbulbs) {
        lightbulbs = lightbulbs.filter(e => e.id !== instanceId);
    }

    rotate_colors(colors) {
        if (!colors.length) return;
        for (const { light } of this.lightbulbs) {
            const index = faker.random.number({
                min: 0,
                max: colors.length - 1
            });
            light.setColor(colors[index], 0.2);
        }
    }

    set_colors(colors) {
        if (!colors) return;
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            this.rotate_colors(colors.map(e => e.replace("#", "")));
        }, 500);
    }
}

module.exports = Tradfri;
