---
title: Documents it had never seen
year: 2026
role: rehearsal, evaluation
tags: [decision model, review lane, calibration]
link: https://devakmmm.github.io/
---

The same recipe, asked one question about a document: is this the kind of document it claims to be?

- On familiar document types: 100% accuracy, 0.000 calibration error
- On types it had never seen: 47%, confidently wrong. It had learned "not a known negative, so yes"

Paired with one simple second check, the model accepts only when both agree, rejects only when both
agree, and sends the rest to a person. On the familiar set that is 4% to review with zero wrong. On
the unfamiliar set it is 57% to review, still zero wrong. Novelty turns into review work instead of
silent mistakes, which is the property that matters when a decision is worth money.
