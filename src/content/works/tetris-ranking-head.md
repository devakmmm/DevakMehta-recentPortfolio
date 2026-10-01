---
title: Tetris, picking the best spot
year: 2026
role: training, evaluation
tags: [decision model, ranking, calibration]
link: https://devakmmm.github.io/
---

A model that picks where the next Tetris piece goes. It scores every possible landing spot for the
current piece and takes the best one, so it compares the options instead of judging each one alone.

- Trained in about 27 minutes on the integrated GPU
- Played 1,000 pieces on 2 of 3 test games, matching its teacher. On the third it topped out at 351 pieces, where the teacher reached 474

The first version judged one spot at a time. Its probabilities were accurate and it still played
badly, because the question it answered was not the decision the game needed. Training it to pick the
best of all the spots fixed that. It learned by copying a teacher's picks, so the teacher is its
ceiling.
