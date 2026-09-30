---
title: Robotics lab
year: 2026
role: training, evaluation
tags: [imitation learning, integrated GPU, sim first]
link: https://devakmmm.github.io/
---

Imitation-learning policies trained on a laptop with no discrete GPU, in simulation first, hardware
second at every step.

- ACT trains at 4.9 steps per second; a diffusion policy beat it on reward at a quarter of the compute
- Task success after 10,000 steps: 0%, reported as such
- The training environment is firewalled off the network by 61 rules

Mid-run the laptop started swapping: 1.35 seconds per step became 11.2, with 39 million page faults.
A wake-word training job and ten editor sessions had taken the memory. The page-in rate was the
measurement; the cause was an inference until the sessions were closed and the rate recovered.
