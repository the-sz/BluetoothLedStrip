[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)

# BluetoothLedStrip
Control LED Strips that use the 'MagicStrip' [iOS](https://apps.apple.com/us/app/magicstrip-rgb/id1190522748)/[Android](https://play.google.com/store/apps/details?id=com.jtkj.magicstrip) and 'Zengge' [Android](https://play.google.com/store/apps/details?id=com.zengge.blev2) app.

## Supported Devices
Two different protocols/devices are supported:
- Tested with a Bluetooth device named 'HTZM', but should work also with 'JMC-A', 'JMC-B', 'MAGIC_SHOE', 'MAGIC_LAMP', 'LCF', 'CoolStripMic', 'CRGB', 'FS0001' and 'FS0002' devices.
- Devices starting with the Bluetooth device name 'LEDnetWF'.

## Demo
See [example/example.html](example/example.html) for usage.

See https://the-sz.com/products/bluetooth_led_strip/ for a real life demo.

## Usage
Just include the script:

    <script type="module"
            src="https://cdn.jsdelivr.net/gh/the-sz/BluetoothLedStrip/dist/BluetoothLedStrip.js">
    </script>

And call the few functions.

### Create a new device
	device = new BluetoothLedStrip.Device();

### Connect to the device
	device.connect(onConnect, onDisconnect, onError);
This will open the Bluetooth dialog in the browser.

### Call functions to control the LEDs
#### device.setRGB()
	device.setRGB(red, green, blue);
Set LEDs to the given value. Each parameter can be between 0 and 255.

#### device.setBrightness()
	device.setBrightness(brightness);
Set the overall brightness between 0 and 255 for MagicStrip or 0 and 100 for LEDnetWF.

#### device.setSwitch()
	device.setSwitch(value);
Toggle on/off. The parameter `value` seems to be ignored by the 'MagicStrip' device.

#### device.setMode()
	device.setMode(mode);
Show a specifc animation. `mode` can be between 0 and 40 (MagicStrip) or 1 and 113 (LEDnetWF).

#### device.setSpeed()
	device.setSpeed(speed);
Set the animation speed between 0 (fastest) and 255 (slowest) for MagicStrip or 0 (slowest) and 100 (fastest) for LEDnetWF.

## License
[GNU General Public License v3.0](LICENSE.md)

## Acknowledgement
https://github.com/8none1/zengge_lednetwf did the protocol reverse engineering on the LEDnetWF protocol.