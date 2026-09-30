---
title: The puck
year: 2026
role: firmware, bridge, enclosure
tags: [ESP32-S3, voice assistant, local only]
link: https://devakmmm.github.io/
---

A coaster-sized talking assistant that lives on the desk. Say the wake word and ask; the puck
listens, sends the audio to the model running on the laptop next to it, and speaks the answer back.
The ring of 16 lights shows what it is doing, listening, thinking or speaking, the same states the
board on the laptop screen goes through.

- Inside: an ESP32-S3, a microphone, a speaker, a 16-pixel LED ring and one button
- Firmware written from scratch, with its own WebSocket server and its own LED driver, and no third-party libraries
- Everything intelligent stays on the laptop; the puck only moves audio and shows state
- Audio never leaves the local network: the laptop dials the puck, and the puck opens no inbound port

The object on the desk is the real enclosure at its real size, 80 by 110 by 45 millimetres, down to
the speaker grille on a 5 millimetre grid. Click the laptop to see the board the ring follows.
