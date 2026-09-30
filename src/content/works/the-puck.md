---
title: The puck
year: 2026
role: firmware, bridge, enclosure
tags: [ESP32-S3, zero libraries, voice satellite]
link: https://devakmmm.github.io/
---

A coaster-sized box on the desk: WiFi microphone, speaker, a 16-pixel LED ring and a button.
Everything intelligent stays on the laptop; the puck only moves audio and shows state.

- 961,315 bytes of firmware with zero third-party libraries: its own WebSocket server, its own LED driver
- 37 tests, a loopback simulator, and a laptop bridge
- Mic audio never leaves the LAN. The laptop dials the puck; it opens no inbound port

First power-on found three bugs the simulator could not catch. WiFi joined once and never retried.
Every pairing closed because the firmware matched `"token":"…"` and Python writes `"token": "…"` with
a space. The watchdog only ran while paired, so a vanished bridge froze the ring. The lesson: a
simulator more lenient than the real device proves nothing about the device.

The object on the desk is the real enclosure at its real size, 80 by 110 by 45 millimetres, down to
the speaker grille on a 5 millimetre grid.
