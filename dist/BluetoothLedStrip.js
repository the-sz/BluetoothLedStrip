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
        Method[Method["SWITCH"] = 4] = "SWITCH";
        Method[Method["MODE"] = 7] = "MODE";
        Method[Method["BRIGHTNESS"] = 8] = "BRIGHTNESS";
        Method[Method["SPEED"] = 9] = "SPEED";
    })(Method = BluetoothLedStrip.Method || (BluetoothLedStrip.Method = {}));
    ;
    const guidService = '0000fff0-0000-1000-8000-00805f9b34fb';
    const guidCharacteristic = '0000fff1-0000-1000-8000-00805f9b34fb';
    class Device {
        constructor() {
            this.characteristic = undefined;
            this.onError = undefined;
            this.onConnect = undefined;
            this.onDisconnect = undefined;
        }
        connect(onConnect, onDisconnect, onError) {
            return __awaiter(this, void 0, void 0, function* () {
                // save callback function
                this.onConnect = onConnect;
                this.onDisconnect = onDisconnect;
                this.onError = onError;
                try {
                    // select device which supports the service
                    const options = { filters: [{ services: [guidService] }] };
                    const device = yield window.navigator.bluetooth.requestDevice(options);
                    if (device != undefined)
                        console.log('Selected device: ' + device.name + ', Connected: ' + device.gatt.connected);
                    // register device disconnect event
                    device === null || device === void 0 ? void 0 : device.addEventListener('gattserverdisconnected', this.onDisconnected);
                    if (device != undefined)
                        device.bluetoothLedStripDevice = this;
                    // connect to device
                    const server = yield (device === null || device === void 0 ? void 0 : device.gatt.connect());
                    // get service
                    const service = yield (server === null || server === void 0 ? void 0 : server.getPrimaryService(guidService));
                    // get characteristic
                    this.characteristic = yield (service === null || service === void 0 ? void 0 : service.getCharacteristic(guidCharacteristic));
                    // call connect callback
                    if (device != undefined)
                        if (this.onConnect != undefined)
                            this.onConnect(device);
                }
                catch (exception) {
                    console.log(exception);
                    if (this.onError != undefined)
                        this.onError(exception);
                }
            });
        }
        send(method, data) {
            if (this.characteristic == undefined)
                return;
            try {
                // send byte stream to characteristic
                this.characteristic.writeValueWithoutResponse(new Uint8Array([method, ...data])).then((_) => {
                });
            }
            catch (exception) {
                console.log(exception);
            }
        }
        // set rgb value
        setRGB(red, green, blue) {
            this.send(Method.RGB, new Uint8Array([red, green, blue]));
        }
        // set switch
        setSwitch(switchBoolean) {
            this.send(Method.SWITCH, new Uint8Array([switchBoolean]));
        }
        // set mode
        setMode(mode) {
            this.send(Method.MODE, new Uint8Array([mode]));
        }
        // set brightness
        setBrightness(brightness) {
            this.send(Method.BRIGHTNESS, new Uint8Array([brightness]));
        }
        // set speed
        setSpeed(speed) {
            this.send(Method.SPEED, new Uint8Array([speed]));
        }
        // device disconnect event callback
        onDisconnected(event) {
            const device = event.target;
            console.log(`Device ${device === null || device === void 0 ? void 0 : device.name} is disconnected.`);
            // call disconnect callback
            if (device != undefined)
                if (device.bluetoothLedStripDevice.onDisconnect != undefined)
                    device.bluetoothLedStripDevice.onDisconnect(device);
        }
    }
    BluetoothLedStrip.Device = Device;
})(BluetoothLedStrip || (BluetoothLedStrip = {}));
//# sourceMappingURL=BluetoothLedStrip.js.map