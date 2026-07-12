import { MacbookScroll } from '../components/ui/macbook-scroll'
import { motion } from 'motion/react'

export default function About() {
  return (
    <section className="overflow-hidden">
      {/* MacBook Scroll Hero — shows a sleek screen image as the laptop opens (hidden on mobile) */}
      <div className="hidden md:block">
      <MacbookScroll
        title={
          <span className="text-4xl font-extrabold tracking-tight text-textHeading dark:text-white sm:text-5xl">
            A smarter campus{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              sharing experience
            </span>
          </span>
        }
        showGradient={true}
      >
        {/* Concise content that fits inside the screen without scrolling */}
        <div className="flex h-full flex-col items-center justify-center text-center px-6 bg-[#121821] rounded-lg">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3 font-serif">
            CampusReuse
          </h2>
          <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
            AI-powered marketplace for college communities
          </p>
          <div className="mt-6 flex gap-3 text-xs font-mono text-cyan-400 tracking-wider">
            <span>Sustainable</span>
            <span className="text-slate-500">•</span>
            <span>Secure</span>
            <span className="text-slate-500">•</span>
            <span>Smart</span>
          </div>
        </div>
      </MacbookScroll>
      </div>

      {/* Full content section — appears naturally below the laptop */}
      <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-16">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative space-y-10 text-base leading-relaxed text-text dark:text-gray-300 md:text-lg"
        >
          <div>
            <h2 className="mb-4 text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              About CampusReuse
            </h2>
            <p>
              Every semester, thousands of perfectly usable books, electronics,
              hostel essentials and study materials sit unused while other
              students spend money buying the same items brand new.
            </p>
            <p className="mt-4">
              Similarly, students frequently travel home for weekends or commute to events alone, spending excessively on cabs or fuel, while classmates making the exact same journey struggle to find affordable transport.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-lg font-semibold text-textHeading dark:text-white">
              CampusReuse was built to solve this problem.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p>
              CampusReuse is an AI-powered marketplace designed exclusively for
              college communities, enabling students to buy, sell, and discover
              pre-owned products within a trusted campus network. By connecting
              buyers and sellers directly, the platform helps students save
              money, reduce waste, and give products a second life.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              The Platform
            </h3>
            <p>
              Unlike traditional marketplaces, CampusReuse combines secure
              authentication, intelligent recommendations and semantic search to
              make product discovery faster and more relevant. Students can sign
              in using their google accounts, browse listings, save favorite
              items, communicate securely with sellers and receive personalized
              recommendations based on their interests and interactions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              RideShare & Connectivity
            </h3>
            <p>
              To further support our campus community, we've integrated a real-time RideShare feature. Students can easily discover, create, and join carpool trips for weekend travels or events. Powered by WebSockets, our live Trip Chat allows passengers and drivers to coordinate seamlessly within the platform, making campus travel cheaper and more sustainable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              The Technology
            </h3>
            <p>
              Behind the scenes, the platform leverages modern cloud and AI
              technologies including Spring Boot, React, PostgreSQL, Redis,
              Docker, AWS and Natural Language Processing models to deliver a
              scalable and intelligent user experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Our Vision
            </h3>
            <p>
              To create a sustainable digital ecosystem where students can
              easily exchange resources, reduce unnecessary spending, and build
              a stronger campus community through technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-t border-border pt-10 text-center dark:border-darkBorder"
          >
            <p className="text-xl font-semibold text-textHeading dark:text-white">
              CampusReuse is more than a marketplace.
            </p>
            <p className="mt-2 text-text dark:text-gray-400">
              It's a smarter and more sustainable way for students to share
              resources within their campus.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
