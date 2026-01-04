import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { name: "React / Vite", level: 92 },
  { name: "TypeScript", level: 88 },
  { name: "Node.js", level: 86 },
  { name: "Python", level: 84 },
  { name: "APIs / OAuth", level: 82 },
  { name: "SQL / PostgreSQL", level: 80 },
];

const technologies = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Express",
  "OAuth 2.0",
  "REST APIs",
  "WebSockets",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Linux",
  "Git",
  "CI/CD",
];

export default function SkillsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-32 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6"
          >
            Skills & Technologies
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-16"
          >
            My <span className="text-gradient">Expertise</span>
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-foreground">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${skill.level}%` } : {}}
                      transition={{ delay: 0.6 + index * 0.1, duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--glow-purple)), hsl(var(--glow-pink)))",
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap gap-3"
            >
              {technologies.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="px-4 py-2 glass-card cosmic-border rounded-lg text-sm font-medium text-foreground cursor-default transition-colors hover:text-primary"
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
