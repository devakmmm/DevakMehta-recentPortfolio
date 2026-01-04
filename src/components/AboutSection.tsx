import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-32 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6"
          >
            About Me
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-8"
          >
            Hi, I'm <span className="text-gradient">Devak Mehta</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6 text-lg text-muted-foreground"
          >
            <p>
              I build scalable backend systems and modern frontends — shipping fast,
              clean, and production-ready. I enjoy turning ambiguous problems into
              reliable products with strong UX and strong engineering.
            </p>

            <p>
              My focus is full-stack development (React, Node, Python), API design,
              and cloud deployment. I care about clarity: maintainable code, measurable impact,
              and interfaces that feel effortless.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <div className="glass-card cosmic-border rounded-xl px-6 py-4">
              <div className="text-2xl font-bold text-gradient">Queens College (CUNY)</div>
              <div className="text-sm text-muted-foreground">Computer Science • Math Minor</div>
            </div>

            <div className="glass-card cosmic-border rounded-xl px-6 py-4">
              <div className="text-2xl font-bold text-gradient">NYC</div>
              <div className="text-sm text-muted-foreground">Based in Queens</div>
            </div>

            <div className="glass-card cosmic-border rounded-xl px-6 py-4">
              <div className="text-2xl font-bold text-gradient">Open to Internships</div>
              <div className="text-sm text-muted-foreground">Summer 2026 roles</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
