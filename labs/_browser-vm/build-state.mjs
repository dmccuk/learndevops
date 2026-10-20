#!/usr/bin/env node
/**
 * Boots the in-browser VM image once in Node, waits for the learner's shell,
 * and saves the emulator state. Restoring this state in the browser starts
 * the VM in seconds instead of booting Linux from scratch.
 *
 * Adapted from v86's tools/docker/alpine/build-state.js (BSD-2-Clause).
 *
 * Usage: node build-state.mjs <out-dir> <v86-repo-dir>
 *   <out-dir> must contain fs.json and rootfs-flat/ from the image build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { V86 } from 'v86';

const [outDir, v86Dir] = process.argv.slice(2);
const MEMORY_MB = 256;
const TIMEOUT_MS = 10 * 60 * 1000;

const emulator = new V86({
	bios: { url: path.join(v86Dir, 'bios/seabios.bin') },
	vga_bios: { url: path.join(v86Dir, 'bios/vgabios.bin') },
	autostart: true,
	memory_size: MEMORY_MB * 1024 * 1024,
	vga_memory_size: 2 * 1024 * 1024,
	net_device: { type: 'virtio', relay_url: 'inbrowser' },
	bzimage_initrd_from_filesystem: true,
	cmdline:
		'rw root=host9p rootfstype=9p rootflags=trans=virtio,cache=loose modules=virtio_pci tsc=reliable init_on_free=on console=ttyS0',
	filesystem: {
		baseurl: path.join(outDir, 'rootfs-flat'),
		basefs: path.join(outDir, 'fs.json'),
	},
});

const timer = setTimeout(() => {
	console.error('Timed out waiting for the VM to boot.');
	console.error(text.slice(-2000));
	process.exit(1);
}, TIMEOUT_MS);

console.log('Booting the VM ...');
let text = '';
let stage = 'boot';

emulator.add_listener('serial0-output-byte', (byte) => {
	text += String.fromCharCode(byte);

	// Autologin lands at a bash prompt such as "learner@ld-vm:~$ ".
	if (stage === 'boot' && /learner@ld-vm[^\n]*\$ $/.test(text)) {
		stage = 'settle';
		console.log('Logged in. Settling ...');
		// Unload the network driver so restored copies can load it with their
		// own MAC address (see v86 docs/networking.md, state images).
		emulator.serial0_send(
			"clear; sudo -n true 2>/dev/null; echo learner | sudo -S sh -c 'rmmod virtio_net; sync; echo 3 > /proc/sys/vm/drop_caches'; clear; echo LD-READY\n",
		);
	}

	if (stage === 'settle' && text.endsWith('LD-READY\r\n')) {
		stage = 'save';
		setTimeout(async () => {
			const state = await emulator.save_state();
			const file = path.join(outDir, 'state.bin');
			fs.writeFileSync(file, new Uint8Array(state));
			console.log(`Saved ${file} (${(state.byteLength / 1048576).toFixed(1)} MB before compression)`);
			clearTimeout(timer);
			emulator.destroy();
			process.exit(0);
		}, 5000);
	}
});
