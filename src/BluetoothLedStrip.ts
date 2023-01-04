export namespace BluetoothLedStrip
{
	export enum Method
	{
		RGB = 0x03,
		SWITCH = 0x04,
		MODE = 0x07,
		BRIGHTNESS = 0x08,
		SPEED = 0x09,
	};

	const guidService: string = '0000fff0-0000-1000-8000-00805f9b34fb';
	const guidCharacteristic: string = '0000fff1-0000-1000-8000-00805f9b34fb';

	export class Device
	{
		characteristic: any = undefined;
		onConnect?: (device: any) => void = undefined;
		onDisconnect?: (device: any) => void = undefined;

		async connect(onConnect?: (device: any) => void, onDisconnect?: (device: any) => void)
		{
			// save callback function
			this.onConnect = onConnect!;
			this.onDisconnect = onDisconnect!;

			// select device which supports the service
			let device: any;
			try
			{
				const options = { filters: [ { services: [guidService] } ] };
				device = await (window.navigator as any).bluetooth.requestDevice(options);

				if (device != undefined)
					console.log('Selected device: ' + device.name + ', Connected: ' + device.gatt.connected);
			}
			catch (exception)
			{
				console.log(exception);
			}

			// register device disconnect event
			device?.addEventListener('gattserverdisconnected', this.onDisconnected);
			if (device != undefined)
				device.bluetoothLedStripDevice = this;

			// connect to device
			const server = await device?.gatt.connect();

			// get service
			const service = await server?.getPrimaryService(guidService);

			// get characteristic
			this.characteristic = await service?.getCharacteristic(guidCharacteristic);

			// call connect callback
			if (device != undefined)
				if (this.onConnect != undefined)
					this.onConnect(device);
		}

		send(method: Method, data: Uint8Array)
		{
			if (this.characteristic == undefined)
				return;

			// send byte stream to characteristic
			this.characteristic.writeValueWithoutResponse(new Uint8Array([ method, ...data ])).then((_: any) =>
			{
			});
		}

		// set rgb value
		setRGB(red: number, green: number, blue: number)
		{
			this.send(Method.RGB, new Uint8Array([red, green, blue]));
		}

		// set switch
		setSwitch(switchBoolean: number)
		{
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

		setMode(mode: number)
		{
			this.send(Method.MODE, new Uint8Array([mode]));
		}

		// set brightness
		setBrightness(brightness: number)
		{
			this.send(Method.BRIGHTNESS, new Uint8Array([brightness]));
		}

		// set speed
		setSpeed(speed: number)
		{
			this.send(Method.SPEED, new Uint8Array([speed]));
		}

		// device disconnect event callback
		onDisconnected(event: Event)
		{
			const device = event.target as any;

			console.log(`Device ${device?.name} is disconnected.`);

			// call disconnect callback
			if (device != undefined)
				if (device.bluetoothLedStripDevice.onDisconnect != undefined)
					device.bluetoothLedStripDevice.onDisconnect(device);
		}
	}
 }
