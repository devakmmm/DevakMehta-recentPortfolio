---
title: Sentence Snake
year: 2026
role: model, game, replay page
tags: [decision model, calibration, 149M parameters]
link: https://devakmmm.github.io/sentence-snake/
---

A 149M-parameter model plays Snake with no safety check in code. Before every move the game writes
one sentence for each of the three options, the model answers one question with a probability, and
the snake takes the highest. No search, no lookahead, no pixels.

- Trained in under 8 minutes on a laptop's integrated GPU
- 35 to 77 ms per move
- Calibrated: when it says 35%, it is right about 34% of the time
- On 10 games it had never seen, it beat the rule it learned from 3 times and lost 7

The losses taught more. In one game it died choosing between a move it scored 4.6% and one it scored
3.6%. Neither fit the question, and it was rating each option alone instead of comparing them. The
fix in Tetris was a ranking head; Snake is next.

<iframe src="https://devakmmm.github.io/sentence-snake/" title="Sentence Snake replays" loading="lazy" style="width:100%;aspect-ratio:16/10;border:0;border-radius:12px;background:#0d1117"></iframe>

Every probability on the replay is the one the model gave on that move.
