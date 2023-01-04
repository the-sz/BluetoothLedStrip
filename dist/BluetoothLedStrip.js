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
            this.onConnect = undefined;
            this.onDisconnect = undefined;
        }
        connect(onConnect, onDisconnect) {
            return __awaiter(this, void 0, void 0, function* () {
                // save callback function
                this.onConnect = onConnect;
                this.onDisconnect = onDisconnect;
                // select device which supports the service
                let device;
                try {
                    const options = { filters: [{ services: [guidService] }] };
                    device = yield window.navigator.bluetooth.requestDevice(options);
                    if (device != undefined)
                        console.log('Selected device: ' + device.name + ', Connected: ' + device.gatt.connected);
                }
                catch (exception) {
                    console.log(exception);
                }
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
        // set switch
        setSwitch(switchBoolean) {
            this.send(Method.SWITCH, new Uint8Array([switchBoolean]));
        }
        // set mode
        // 0 fade
        // flashing
        // 1 blue blink, 2 green bloink 3 red blionk 4 cyan blionk 5 lilalc blonk 6 yellow blonk 7 white bloink
        // breathing
        // 8 soft bloink blue - 14 white soft bloink
        // strobe
        // 15 blue dripple flash - 21 white dripple flash
        // gradient
        // 22 blue/red fade (RBR) 23 white lila cfade (WVW) 24 green white lila fade (GVG) 25 white green blue fade (BYB) 26 white red blue fade (RCR) 27 white blue green fade (YCY) 28 lila white blue fade (VCV) 29 white lila green fade (VYV)
        // ??? three color transistions
        // ??? colorful jump
        // ??? three color alternating breathing
        // ??? colorful alternate breathing
        // ??? colorful gradient
        // ??? six color gradient
        // ??? rgb gradient
        // 30 red green blue 							blink
        // 31 white green blue red lila 				blink
        // 32 red green blue 							step by step fade
        // 33 white green blue red lila 				step by step fade
        // 34,35,36 										fade
        // three color flashing              colorful flashing
        // 37 red green blue blink wit pause 38 white green blue red lila blink with pause
        // three color strobe                     colorful strobe
        // 39 red green blue blink wit pause long 40 white green blue red lila blink with pause long
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