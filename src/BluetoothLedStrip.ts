export namespace BluetoothLedStrip
{
	export enum Method
	{
		RGB = 0x03,
	};

	export class Device
	{
		characteristic: any = undefined;

		async connect()
		{
			// select device which supports the service
			let device: any;
			try
			{
				const options = { filters: [ { services: ['0000fff0-0000-1000-8000-00805f9b34fb'] } ] };
				device = await (window.navigator as any).bluetooth.requestDevice(options);

				if (device != undefined)
				{
					console.log('Selected device: ' + device.name + ', Connected: ' + device.gatt.connected);
				}
			}
			catch (exception)
			{
				console.log(exception);
			}

			// register device disconnect event
			device?.addEventListener('gattserverdisconnected', this.onDisconnected);

			// connect to device
			const server = await device?.gatt.connect();

			// get service
			const service = await server?.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');

			// get characteristic
			this.characteristic = await service?.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
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

		// device disconnect event callback
		onDisconnected(event: Event)
		{
			const device = event.target as any;
			console.log(`Device ${device?.name} is disconnected.`);
		}
	}
 }
