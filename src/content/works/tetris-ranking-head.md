---
title: Tetris, the ranking head
year: 2026
role: training, evaluation
tags: [decision model, ranking, calibration]
link: https://devakmmm.github.io/
---

The first Tetris head was calibrated and still played badly. Its probabilities were honest; its
label was wrong. It answered "is this a good spot?" about each spot alone, while the decision is
"which spot is best this turn?"

The fix was a ranking head: one softmax over the turn's spots instead of a yes/no per spot. Trained
in about 27 minutes on the integrated GPU, it survives 1,000 pieces and matches its teacher on 2 of 3
seeds. It is bounded by the teacher, because it learned by copying the teacher's picks.

The loss must match the decision. That sentence is the whole lesson, and it moved straight into the
next build.
