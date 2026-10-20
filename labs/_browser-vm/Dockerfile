# Linux image for the in-browser VM (v86).
#
# Based on v86's official Alpine recipe (tools/docker/alpine in
# github.com/copy/v86, BSD-2-Clause), with the tools the early Linux, Git and
# SSH units need. v86 emulates a 32-bit x86 PC, so this must be an i386 image.
#
# Built by .github/workflows/browser-vm.yml. See labs/_browser-vm/README.md.
FROM docker.io/i386/alpine:3.21.0

ENV KERNEL=virt

# Boot and init (from the v86 recipe)
RUN apk add --no-cache openrc alpine-base agetty alpine-conf linux-$KERNEL linux-firmware-none

# Tools for the course units
RUN apk add --no-cache \
	bash bash-completion coreutils findutils grep sed gawk diffutils \
	procps-ng util-linux less nano vim file tree tar gzip \
	git openssh openssh-sftp-server rsync sudo shadow iproute2 iputils htop

# A normal user for the labs, with sudo. The password is shown on the page.
RUN useradd -m -s /bin/bash learner \
	&& echo 'learner:learner' | chpasswd \
	&& echo 'learner ALL=(ALL) ALL' > /etc/sudoers.d/learner \
	&& echo 'learner ALL=(root) NOPASSWD: /usr/local/sbin/ld-net' >> /etc/sudoers.d/learner \
	&& chmod 440 /etc/sudoers.d/learner \
	&& passwd -l root \
	&& printf '%s\n' "PS1='\\u@\\h:\\w\\$ '" "alias ls='ls --color=auto'" > /home/learner/.bashrc \
	&& printf '%s\n' '[ -f ~/.bashrc ] && . ~/.bashrc' > /home/learner/.bash_profile \
	&& chown learner:learner /home/learner/.bashrc /home/learner/.bash_profile

# Log the learner in automatically on the serial console, which the page shows
# as a terminal. There is no screen, so no getty on tty1.
RUN sed -i '/^tty[0-9]/d' /etc/inittab \
	&& echo 'ttyS0::respawn:/sbin/agetty --autologin learner -s ttyS0 115200 vt100' >> /etc/inittab

# Docker manages /etc/hostname, so the page sets each VM's name after start
# (see ld-net). Blank the welcome message so learners see a clean terminal.
RUN : > /etc/motd

# SSH server, for units that connect two in-browser VMs. Host keys are made at
# build time, so every VM from this image shares them; acceptable for a
# throwaway lab with no outside network.
RUN ssh-keygen -A \
	&& sed -ri 's/^#?PasswordAuthentication .*/PasswordAuthentication yes/' /etc/ssh/sshd_config \
	&& rc-update add sshd default

# Called by the page after it restores a saved state: reload the network
# driver (the MAC address changes on restore), then set this VM's name and
# address. Usage: ld-net <hostname> <ip/prefix>
COPY ld-net /usr/local/sbin/ld-net
RUN chmod 755 /usr/local/sbin/ld-net

# https://wiki.alpinelinux.org/wiki/Alpine_Linux_in_a_chroot#Preparing_init_services
RUN for i in devfs dmesg mdev hwdrivers; do rc-update add $i sysinit; done \
	&& for i in hwclock modules sysctl hostname syslog bootmisc; do rc-update add $i boot; done \
	&& rc-update add killprocs shutdown

# Initramfs with 9p support, so the root filesystem can load over HTTP
RUN mkinitfs -F "base virtio 9p" $(cat /usr/share/kernel/$KERNEL/kernel.release)
