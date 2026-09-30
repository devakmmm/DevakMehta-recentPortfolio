---
title: Tetris, the ranking head
year: 2026
role: training, evaluation
tags: [decision model, ranking, calibration]
link: https://devakmmm.github.io/
---

A model that picks where the next Tetris piece goes. Every landing spot for the current piece is
written up as a sentence, the model scores all of them in one pass, and the piece goes to the top
score: one softmax over the turn's spots, so it compares the options against each other instead of
judging each one alone.

- Trained in about 27 minutes on the integrated GPU
- Survives 1,000 pieces and matches its teacher on 2 of 3 seeds

It learned by copying a teacher's picks, so the teacher is its ceiling. The loss must match the
decision: that sentence is the whole lesson, and it moved straight into the next build.
