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
    let DeviceType;
    (function (DeviceType) {
        DeviceType[DeviceType["UNKNWON"] = 0] = "UNKNWON";
        DeviceType[DeviceType["MAGIC_STRIP"] = 1] = "MAGIC_STRIP";
        DeviceType[DeviceType["LED_NET_WF"] = 2] = "LED_NET_WF";
    })(DeviceType = BluetoothLedStrip.DeviceType || (BluetoothLedStrip.DeviceType = {}));
    ;
    const guidServiceMagicStrip = '0000fff0-0000-1000-8000-00805f9b34fb';
    const guidCharacteristicMagicStrip = '0000fff1-0000-1000-8000-00805f9b34fb';
    const guidServiceLedNetWf = '0000ffff-0000-1000-8000-00805f9b34fb';
    const guidCharacteristicLedNetWf = '0000ff01-0000-1000-8000-00805f9b34fb';
    class Device {
        constructor() {
            this.deviceType = DeviceType.UNKNWON;
            this.counter = 0;
            this.lastMode = 1;
            this.lastBrightness = 100;
            this.lastSpeed = 100;
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
                    const options = { filters: [{ services: [guidServiceMagicStrip] }, { namePrefix: 'LEDnetWF' }], optionalServices: [guidServiceLedNetWf] };
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
                    var service = undefined;
                    try {
                        //
                        // DeviceType.MAGIC_STRIP
                        //
                        var service = yield (server === null || server === void 0 ? void 0 : server.getPrimaryService(guidServiceMagicStrip));
                        this.deviceType = DeviceType.MAGIC_STRIP;
                        // get characteristic
                        this.characteristic = yield (service === null || service === void 0 ? void 0 : service.getCharacteristic(guidCharacteristicMagicStrip));
                    }
                    catch (exception) {
                        //
                        // DeviceType.LED_NET_WF
                        //
                        service = yield (server === null || server === void 0 ? void 0 : server.getPrimaryService(guidServiceLedNetWf));
                        this.deviceType = DeviceType.LED_NET_WF;
                        // get characteristic
                        this.characteristic = yield (service === null || service === void 0 ? void 0 : service.getCharacteristic(guidCharacteristicLedNetWf));
                    }
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
        sendMagicStrip(method, data) {
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
        sendLedNetWf(magic, data) {
            if (this.characteristic == undefined)
                return;
            try {
                // based on https://github.com/8none1/zengge_lednetwf
                const checksum = 0;
                this.counter++;
                const length = magic.length + data.length;
                const packet = new Uint8Array([((this.counter >> 8) & 0xFF),
                    (this.counter & 0xFF),
                    ...[0x80, 0x00, 0x00],
                    length,
                    (length + 1),
                    ...Uint8Array.from(magic),
                    ...data,
                    checksum]);
                // send byte stream to characteristic
                this.characteristic.writeValueWithoutResponse(packet).then((_) => {
                });
            }
            catch (exception) {
                console.log(exception);
            }
        }
        // connvert rgb to hsv
        // based on https://stackoverflow.com/a/54070620
        // due to unknown reason, red and green must be swapped
        // Hue is divided by two to fit in to a single byte, Saturation and Value are percentages from 0 to 100
        rgb2hsv(red, green, blue) {
            red /= 255;
            green /= 255;
            blue /= 255;
            let v = Math.max(red, green, blue);
            let c = v - Math.min(red, green, blue);
            let h = c && ((v == green) ? (red - blue) / c : ((v == red) ? 2 + (blue - green) / c : 4 + (green - red) / c));
            return [(60 * (h < 0 ? h + 6 : h)) / 2, (v && c / v) * 100, v * 100];
        }
        // set rgb value
        setRGB(red, green, blue) {
            if (this.deviceType == DeviceType.MAGIC_STRIP)
                this.sendMagicStrip(Method.RGB, new Uint8Array([red, green, blue]));
            else if (this.deviceType == DeviceType.LED_NET_WF) {
                const hsv = this.rgb2hsv(red, green, blue);
                this.sendLedNetWf([0x0B, 0x3B], new Uint8Array([0xA1, ...Uint8Array.from(hsv), ...new Uint8Array(7)]));
            }
        }
        // set switch
        setSwitch(switchBoolean) {
            if (this.deviceType == DeviceType.MAGIC_STRIP)
                this.sendMagicStrip(Method.SWITCH, new Uint8Array([switchBoolean]));
            else if (this.deviceType == DeviceType.LED_NET_WF)
                this.sendLedNetWf([0x0B, 0x3B], new Uint8Array([((switchBoolean > 0) ? 0x23 : 0x24), ...new Uint8Array(10)]));
        }
        // set mode
        setMode(mode) {
            if (this.deviceType == DeviceType.MAGIC_STRIP)
                this.sendMagicStrip(Method.MODE, new Uint8Array([mode]));
            else if (this.deviceType == DeviceType.LED_NET_WF) {
                this.lastMode = mode;
                this.sendLedNetWf([0x0B, 0x38], new Uint8Array([this.lastMode, this.lastSpeed, this.lastBrightness]));
            }
        }
        // set brightness
        setBrightness(brightness) {
            if (this.deviceType == DeviceType.MAGIC_STRIP)
                this.sendMagicStrip(Method.BRIGHTNESS, new Uint8Array([brightness]));
            else if (this.deviceType == DeviceType.LED_NET_WF) {
                this.lastBrightness = brightness;
                this.sendLedNetWf([0x0B, 0x38], new Uint8Array([this.lastMode, this.lastSpeed, this.lastBrightness]));
            }
        }
        // set speed
        setSpeed(speed) {
            if (this.deviceType == DeviceType.MAGIC_STRIP)
                this.sendMagicStrip(Method.SPEED, new Uint8Array([speed]));
            else if (this.deviceType == DeviceType.LED_NET_WF) {
                this.lastSpeed = speed;
                this.sendLedNetWf([0x0B, 0x38], new Uint8Array([this.lastMode, this.lastSpeed, this.lastBrightness]));
            }
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