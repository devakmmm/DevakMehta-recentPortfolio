---
title: Documents it had never seen
year: 2026
role: rehearsal, evaluation
tags: [decision model, review lane, calibration]
link: https://devakmmm.github.io/
---

A model that reads the start of a document, answers one yes or no question about what kind of
document it is, and gives a probability. When it is unsure, or disagrees with a simple keyword
check, the call goes to a person.

- On 600 generated documents of kinds it knows, 4% went to a person and none were wrong
- On 600 generated documents of kinds it had never seen, the model alone got 47% right. With the keyword check it made no wrong accept or reject, and sent 57% to a person

Novelty turns into review work instead of silent mistakes, which is what matters when a decision is
worth money.
