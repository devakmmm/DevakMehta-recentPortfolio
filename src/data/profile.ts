// Who Devak is, in one place. The minimalist page (src/minimal/render.ts) renders from this, and the
// board on the laptop screen (ui/dvBoard.ts) answers its prompts from it, so the two never disagree.
// Plain data, no import.meta, so vite.config.ts and node:test can both import it.
// Copy rules (tests/copy.test.mjs checks them): plain sentences, no em dashes, no middle-dot chains,
// and each build described by what it is and how it helps, not by how it was built.
// Every claim here was checked against each build's own notes on 2026-09-30: the puck is in
// progress, its replies will come from a hosted model, and the pyramid is a plan.

export interface Build {
  name: string
  line: string
  href?: string
}

export interface Profile {
  name: string
  role: string
  // the hero over the 3D desk, first person
  desk: { title: string; hero: string[] }
  // the minimalist page, first person
  intro: string[]
  // resume: a file in public/ ('resume.pdf') or a full URL; the Resume buttons show only when set
  links: { github: string; linkedin?: string; email?: string; home: string; resume?: string }
  builds: Build[]
  now: string[]
  // what D.V says on the board, about Devak, in the third person
  answers: { who: string[]; built: string[]; now: string[] }
}

const HOME = 'https://devakmmm.github.io/'

export const PROFILE: Profile = {
  name: 'Devak Mehta',
  role: 'AI Engineer',
  desk: {
    title: "Hi, I'm Devak.",
    hero: [
      "I'm an AI engineer. I train my own models and build the harnesses that train, test and run them, including the agent setup I work in every day. Click the laptop to try a copy of D.V, the assistant at the center of it.",
    ],
  },
  intro: [
    'I train my own models and build the harnesses that train, test and run them.',
    'I also build the agent setup I work in every day, and the checks that make AI coding assistants verify their own work.',
  ],
  // LinkedIn and email as Devak published them on his previous site (personal, never the work address)
  links: {
    github: 'https://github.com/devakmmm',
    linkedin: 'https://www.linkedin.com/in/devak-mehta',
    email: 'mdevak44@gmail.com',
    home: HOME,
  },
  builds: [
    {
      name: 'Sentence Snake',
      line: 'A model that plays Snake by reading a plain description of each move and picking the best one. The same idea works for any decision you can put into words, like checking a document or choosing what a person should look at.',
      href: `${HOME}sentence-snake/`,
    },
    {
      name: 'D.V',
      line: 'An assistant I built to work tickets with me. It investigates, runs read-only checks, writes up what it found and helps me prepare the pull request, so my time goes to the decisions.',
    },
    {
      name: 'make-your-claude',
      line: 'Six free add-ons that make an AI coding assistant check its own work. It has to say whether it verified what it claims before it finishes, and it gets a checklist to review its changes before it pushes code.',
      href: 'https://github.com/devakmmm/make-your-claude',
    },
    {
      name: "D.V's Lab",
      line: 'A 3D viewer you control with your bare hands through a webcam. Turn, move and take apart a part on screen to see how a device fits together, with no mouse or headset.',
    },
    {
      name: 'The puck',
      line: "A voice assistant I'm building for my desk, so I can ask a question out loud without leaving what I'm doing. It connects to my laptop today; the microphone and speaker are next.",
    },
    {
      name: 'Robotics lab',
      line: 'A robot that learns a task from demonstrations instead of hand-written instructions. It is in simulation for now.',
    },
  ],
  now: [
    'This site. The 3D desk, the board on its laptop and this page were built this week.',
    "The puck's microphone is next, then its speaker and its ring of lights.",
    "After that, a pepper's ghost pyramid over a spare monitor, so the hand-tracked part looks like it floats.",
  ],
  answers: {
    who: [
      'Devak Mehta is an AI engineer. He trains his own models and builds the harnesses that train, test and run them.',
      'He built D.V, the assistant on this screen, to work tickets with him. It investigates, runs read-only checks and writes up what it found.',
      'His decision models say how sure they are, so a person can take the calls they are unsure about.',
    ],
    built: [
      'Sentence Snake, a model that plays Snake from plain descriptions of each move. The idea works for any decision you can put into words.',
      'D.V, the assistant on this screen, which helps him investigate tickets. This copy runs on invented ones.',
      "D.V's Lab, a 3D part you move with your bare hands through a webcam, to see how a device fits together.",
      'make-your-claude, six free add-ons that make an AI coding assistant check its own work before it finishes.',
    ],
    now: [
      'This site. He built the desk, this board and a one-page version this week.',
      'The puck on the desk, a voice assistant you will be able to talk to. It connects to his laptop today; the microphone and speaker are next.',
      "Then a pepper's ghost pyramid over a spare monitor, so the hand-tracked part looks like it floats.",
    ],
  },
}
