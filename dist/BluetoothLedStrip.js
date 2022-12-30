var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var BluetoothLedStrip;
(function (BluetoothLedStrip) {
    let Method;
    (function (Method) {
        Method[Method["RGB"] = 3] = "RGB";
    })(Method = BluetoothLedStrip.Method || (BluetoothLedStrip.Method = {}));
    ;
    class Device {
        constructor() {
            this.characteristic = undefined;
        }
        connect() {
            return __awaiter(this, void 0, void 0, function* () {
                // select device which supports the service
                let device;
                try {
                    const options = { filters: [{ services: ['0000fff0-0000-1000-8000-00805f9b34fb'] }] };
                    device = yield window.navigator.bluetooth.requestDevice(options);
                    if (device != undefined) {
                        console.log('Selected device: ' + device.name + ', Connected: ' + device.gatt.connected);
                    }
                }
                catch (exception) {
                    console.log(exception);
                }
                // register device disconnect event
                device === null || device === void 0 ? void 0 : device.addEventListener('gattserverdisconnected', this.onDisconnected);
                // connect to device
                const server = yield (device === null || device === void 0 ? void 0 : device.gatt.connect());
                // get service
                const service = yield (server === null || server === void 0 ? void 0 : server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb'));
                // get characteristic
                this.characteristic = yield (service === null || service === void 0 ? void 0 : service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb'));
            });
        }
        send(method, data) {
            if (this.characteristic == undefined)
                return;
            // send byte stream to characteristic
            this.characteristic.writeValueWithoutResponse(new Uint8Array([method, ...data])).then((_) => {
            });
        }
        // set rgb value
        setRGB(red, green, blue) {
            this.send(Method.RGB, new Uint8Array([red, green, blue]));
        }
        // device disconnect event callback
        onDisconnected(event) {
            const device = event.target;
            console.log(`Device ${device === null || device === void 0 ? void 0 : device.name} is disconnected.`);
        }
    }
    BluetoothLedStrip.Device = Device;
})(BluetoothLedStrip || (BluetoothLedStrip = {}));
//# sourceMappingURL=BluetoothLedStrip.js.map