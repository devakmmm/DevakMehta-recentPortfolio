import { motion } from "framer-motion";
import heroSpace from "@/assets/hero-space.jpg";

const stats = [
  { value: "3+", label: "Years Experience" },
  { value: "15+", label: "Apps Deployed" },
  { value: "2.5K+", label: "Users Served" },
  { value: "95%", label: "System Uptime" }
];

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      delayChildren: 0.1,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const statsContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};

const statItem = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function HeroSection() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={heroContainer}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <motion.img
          src={heroSpace}
          alt="Cosmic background"
          className="w-full h-full object-cover object-center"
          loading="lazy"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />

        {/* Mask: cover unwanted bright round area at bottom-right */}
        <div
          aria-hidden
          className="absolute right-0 bottom-0 pointer-events-none"
          style={{
            width: "36rem",
            height: "36rem",
            transform: "translate(25%, 15%)",
            background:
              "radial-gradient(circle at 60% 60%, rgba(6,7,12,0.95), rgba(6,7,12,0.85) 30%, transparent 65%)"
          }}
        />

        <motion.div
          style={{ willChange: "transform, opacity" }}
          className="absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-[36px] opacity-25 bg-[hsl(var(--glow-purple))]"
          animate={{ x: [0, 18, -14, 0], y: [0, -10, 6, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Right-side decorative glow removed to improve animation smoothness */}
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={heroItem} className="mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
              Software Engineer
            </span>
          </motion.div>

          <motion.h1 variants={heroItem} className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="text-gradient glow-text">Building</span>
            <span className="text-foreground">, at the</span>
            <br />
            <span className="text-foreground">speed of </span>
            <span className="text-gradient glow-text">light</span>
          </motion.h1>

          <motion.p variants={heroItem} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Full-stack engineer shipping production systems and modern UIs. Scalable backends, clean
            architecture, and high-signal product execution.
          </motion.p>

          <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="#projects"
              className="px-8 py-3 rounded-full bg-foreground text-background font-semibold transition-all hover:opacity-90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
            </motion.a>

            <motion.a
              href="#about"
              className="px-8 py-3 rounded-full border border-border text-foreground font-medium transition-all hover:bg-foreground/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore More
            </motion.a>

            <motion.a
              href="https://drive.google.com/file/d/1nqLe4IQnoWS1J62PedQh6Z3M9u5wUgPU/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3 rounded-full border border-primary/40 text-primary font-semibold transition-all hover:bg-primary/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Resume
            </motion.a>
          </motion.div>
        </div>

        <motion.div variants={heroItem} className="mt-24 glass-card cosmic-border rounded-2xl p-8 max-w-4xl mx-auto">
          <motion.div
            variants={statsContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={statItem} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          style={{ willChange: "transform" }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-primary"
            style={{ willChange: "opacity" }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
