---
title: Robotics lab
year: 2026
role: training, evaluation
tags: [imitation learning, integrated GPU, simulation]
link: https://devakmmm.github.io/
---

Teaching a robot to imitate demonstrations, in simulation, on a laptop with no discrete GPU. A real
arm (an SO-101) comes once a policy works there.

- Two kinds of policy trained on the same simulated task: ACT and a diffusion policy
- ACT trained at about 4 steps per second. The diffusion policy scored a higher reward after 5,000 steps than ACT did after 40,000, but neither completed the task: 0% success
- The training environment is firewalled off the network by 61 rules, so nothing is fetched mid-run
