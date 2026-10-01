---
title: The puck
year: 2026
role: firmware, bridge
tags: [ESP32-S3, voice assistant, in progress]
link: https://devakmmm.github.io/
---

A desk voice assistant I'm building on an ESP32-S3 board. When it's done, you say the wake word and
ask a question. The laptop turns your speech into text, a hosted model (Claude) writes the reply, and
the laptop speaks it back through the puck. A ring of 16 lights will show when it is listening,
thinking or speaking.

- The firmware is written from scratch, with its own WebSocket server and LED driver and no third-party libraries. The build is 961,315 bytes
- On the real board it joins WiFi and pairs with the laptop. The microphone, speaker, ring and button come next
- Audio stays on my home network. Only the transcript text goes to the model
- The laptop connects to the puck, so the laptop opens no inbound port, and the puck itself makes no outbound connections

The object on the desk is modelled on the real enclosure at its real size, 80 by 110 by 45
millimetres, with the speaker grille planned on a 5 millimetre grid. On this desk, its ring follows
the board on the laptop.
