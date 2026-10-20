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
import { fileURLToPath } from 'node:url';
import { V86 } from 'v86';

const [outDir, v86Dir] = process.argv.slice(2);
const MEMORY_MB = 256;
const TIMEOUT_MS = 10 * 60 * 1000;

// This script runs from a folder where the v86 npm package is installed.
const wasmPath = fileURLToPath(new URL('./node_modules/v86/build/v86.wasm', import.meta.url));

const emulator = new V86({
	wasm_path: wasmPath,
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

// Commands run once before saving, so the files they need are already loaded
// in the saved state. Restored VMs then start in about a second, not ten.
const WARM_UP = [
	'sudo ld-net warm 10.5.0.99/24',
	'bash -ic true',
	'git --version',
	'ls -la /etc > /dev/null',
	'cat /etc/os-release > /dev/null',
	'grep -c a /etc/passwd > /dev/null',
	"awk 'END{print NR}' /etc/passwd > /dev/null",
	'sed -n 1p /etc/passwd > /dev/null',
	'ps aux > /dev/null',
	'free -m > /dev/null',
	'df -h > /dev/null',
	'id > /dev/null',
	'ping -c 1 127.0.0.1 > /dev/null',
	'ssh -V 2> /dev/null',
	'scp 2> /dev/null',
	'rsync --version > /dev/null',
	'nano --version > /dev/null',
	'less --version > /dev/null',
	'tree --version > /dev/null',
].join('; ');

// The serial port buffers only a few characters, so type in small chunks.
function send(input) {
	const chunks = input.match(/[\s\S]{1,8}/g) ?? [];
	let k = 0;
	const next = () => {
		if (k < chunks.length) {
			emulator.serial0_send(chunks[k++]);
			setTimeout(next, 10);
		}
	};
	next();
}

console.log('Booting the VM ...');
let text = '';
let stage = 'boot';

emulator.add_listener('serial0-output-byte', (byte) => {
	text += String.fromCharCode(byte);

	// Autologin lands at a bash prompt such as "learner@localhost:~$ ".
	if (stage === 'boot' && /learner@[^\n]*\$ $/.test(text)) {
		stage = 'warm';
		console.log('Logged in. Warming up ...');
		send(`${WARM_UP}; echo LD-WARM\n`);
	}

	if (stage === 'warm' && text.endsWith('LD-WARM\r\n')) {
		stage = 'settle';
		console.log('Warm. Settling ...');
		// Unload the network driver so restored copies can load it with their
		// own MAC address (see v86 docs/networking.md, state images). Keep the
		// page cache: it makes the first commands after restore faster.
		send("echo learner | sudo -S sh -c 'rmmod virtio_net; hostname localhost; sync'; clear; echo LD-READY\n");
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
