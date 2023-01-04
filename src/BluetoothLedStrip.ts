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
				const options = { filters: [ { services: ['0000fff0-0000-1000-8000-00805f9b34fb'] } ] };
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
			const service = await server?.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');

			// get characteristic
			this.characteristic = await service?.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');

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
