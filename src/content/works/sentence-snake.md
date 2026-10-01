---
title: Sentence Snake
year: 2026
role: model, game, replay page
tags: [decision model, calibration, 149M parameters]
link: https://devakmmm.github.io/sentence-snake/
---

A 149M-parameter model plays Snake. Before every move the game writes one sentence for each of the
three options, the model answers one question about each with a probability, and the snake takes
the highest. No rule overrides the model's pick.

- Trained in under 8 minutes on a laptop's integrated GPU
- 35 to 77 ms per move
- It is calibrated. When it says 35%, it is right about 34% of the time
- On 10 games it had never seen, it beat the rule it learned from in 3, and averaged 24 food to the rule's 38

The model never sees the board. The game's code checks each move for crashes and open space and
writes that into the sentence, and the model says how likely the move is to go well. Because its
probabilities match how often it is right, the game can use them directly.

<iframe src="https://devakmmm.github.io/sentence-snake/" title="Sentence Snake replays" loading="lazy" style="width:100%;aspect-ratio:16/10;border:0;border-radius:12px;background:#0d1117"></iframe>

Every probability on the replay is the one the model gave on that move.
