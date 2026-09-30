---
title: Robotics lab
year: 2026
role: training, evaluation
tags: [imitation learning, integrated GPU, sim first]
link: https://devakmmm.github.io/
---

Teaching a robot arm by demonstration, on a laptop with no discrete GPU. Policies learn in
simulation first; the hardware step comes once a policy works there. The path runs from a simulated
arm to a balancing task to a real SO-101.

- Two policy families trained and compared on the same task: ACT at 4.9 steps per second, and a diffusion policy that reached a higher reward at a quarter of the compute
- Every run records its speed, its memory and its task success, so the next run is compared against a number
- The training environment is firewalled off the network by 61 rules; nothing is fetched mid-run
