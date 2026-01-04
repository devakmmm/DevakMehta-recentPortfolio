import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github } from "lucide-react";

const projects = [
  {
    title: "LeetSight",
    description:
      "LeetCode analytics with AI-powered insights. Track readiness, velocity, and get topic recommendations.",
    tags: ["React", "Node.js", "LeetCode API", "AI"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    github: "https://github.com/devakmmm",
    live: "https://leetsight.netlify.app/",
  },
  {
    title: "Hiring Radar",
    description:
      "Hiring analytics with OAuth 2.0 and real-time market data aggregation (USAJOBS).",
    tags: ["Node.js", "OAuth 2.0", "USAJOBS API"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    github: "https://github.com/devakmmm",
    live: "https://hiringradar.onrender.com/",
  },
  {
    title: "Document Classifier",
    description:
      "ML-based document classification API with a modern deployment-ready interface.",
    tags: ["Python", "ML", "API"],
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    github: "https://github.com/devakmmm",
    live: "https://document-classifier-api-1.onrender.com/",
  },
  {
    title: "Movie Recs Engine",
    description:
      "Movie recommendations with GitHub OAuth and OMDb API integration.",
    tags: ["Node.js", "OAuth 2.0", "OMDb API"],
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    github: "https://github.com/devakmmm",
    live: "https://movierecs.onrender.com/",
  },
  {
    title: "WebSocket Terminal",
    description:
      "Real-time bidirectional communication via WebSocket with multi-node support.",
    tags: ["WebSocket", "Node.js", "Real-time"],
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
    github: "https://github.com/devakmmm",
    live: "https://websocket-chat-6h7v.onrender.com/",
  },
];

export default function ProjectsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-32 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6"
          >
            Featured Work
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-16"
          >
            Selected <span className="text-gradient">Projects</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.15, duration: 0.8 }}
                whileHover={{ y: -10 }}
                className="group glass-card cosmic-border rounded-2xl overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-secondary text-foreground hover:text-primary transition-colors"
                      aria-label="GitHub"
                    >
                      <Github size={18} />
                    </motion.a>
                    <motion.a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-secondary text-foreground hover:text-primary transition-colors"
                      aria-label="Live demo"
                    >
                      <ExternalLink size={18} />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
