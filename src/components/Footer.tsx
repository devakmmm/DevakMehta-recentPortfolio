import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="text-muted-foreground text-sm">
            © {currentYear} Devak Mehta. All rights reserved.
          </div>
          <div className="text-muted-foreground text-sm">
            Built with <span className="text-gradient">passion</span> and code
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
