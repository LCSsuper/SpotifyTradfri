const tradfri = require('node-tradfri-client');

const { get } = require('../utils/config');

class Tradfri {
  constructor() {
    this.client = null;
    this.lightbulbs = [];
  }

  async generate(security_code) {
    console.log(this.client);
    const result = await tradfri.discoverGateway();

    if (!result) return { data: null };

    const { name } = result;

    const c = new tradfri.TradfriClient(name);

    try {
      const data = await c.authenticate(security_code);
      return { result, data };
    } catch (e) {
      return { data: null };
    }
  }

  async start() {
    const configuration = JSON.parse(await get());

    try {
      if (!this.client) {
        this.client = new tradfri.TradfriClient(configuration.tradfri.name);
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
      .on("device updated", this.updated)
      .on("device removed", this.removed)
      .observeDevices();
  }

  updated(device) {
    if (
      device.type === tradfri.AccessoryTypes.lightbulb &&
      device.lightList[0].spectrum === "rgb"
    ) {
      this.lightbulbs[device.instanceId] = device;
    }
  }

  removed(instanceId) {
    delete this.lightbulbs[instanceId];
  }

  set_color(color) {
    for (const {
      lightList: [light]
    } in this.lightbulbs) {
      light.setColor(color);
    }
  }
}

module.exports = Tradfri;
