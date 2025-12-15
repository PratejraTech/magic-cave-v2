/**
 * Enhanced Landing Page - Production-Ready Marketing Page
 * Features: Modern grid layout, generous whitespace, micro UI components
 * Maxim whitespace principle with enticing, inspiring design
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Gift, Star, Calendar, Users } from 'lucide-react';
import Header from '../components/Header';

// Hero gradient orbs for depth
const HeroOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, rgba(255, 107, 157, 0.4), transparent 70%)',
        filter: 'blur(80px)'
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.25, 0.15]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
    <motion.div
      className="absolute top-[20%] right-[15%] w-[600px] h-[600px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, rgba(147, 197, 253, 0.4), transparent 70%)',
        filter: 'blur(80px)'
      }}
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.2, 0.3, 0.2]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1
      }}
    />
    <motion.div
      className="absolute bottom-[10%] left-[50%] w-[450px] h-[450px] rounded-full opacity-15"
      style={{
        background: 'radial-gradient(circle, rgba(196, 78, 232, 0.3), transparent 70%)',
        filter: 'blur(80px)'
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.1, 0.2, 0.1]
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2
      }}
    />
  </div>
);

// Feature card component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -8, scale: 1.02 }}
  >
    {/* Icon with gradient background */}
    <motion.div
      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
      whileHover={{ rotate: 5 }}
    >
      <div className="text-cyan-300">{icon}</div>
    </motion.div>

    {/* Title */}
    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
      {title}
    </h3>

    {/* Description */}
    <p className="text-white/70 leading-relaxed">
      {description}
    </p>

    {/* Hover glow effect */}
    <motion.div
      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(147,197,253,0.1), transparent 70%)'
      }}
    />
  </motion.div>
);

// Stat card component
interface StatCardProps {
  number: string;
  label: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, delay = 0 }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, type: 'spring', stiffness: 100 }}
  >
    <motion.div
      className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-2"
      whileHover={{ scale: 1.1 }}
    >
      {number}
    </motion.div>
    <div className="text-white/60 text-sm uppercase tracking-wider">{label}</div>
  </motion.div>
);

// Testimonial card
interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ quote, author, role, delay = 0 }) => (
  <motion.div
    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
  >
    {/* Quote icon */}
    <div className="text-6xl text-cyan-300/30 mb-4">"</div>

    {/* Quote text */}
    <p className="text-white/80 text-lg leading-relaxed mb-6 italic">
      {quote}
    </p>

    {/* Author */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400" />
      <div>
        <div className="text-white font-semibold">{author}</div>
        <div className="text-white/60 text-sm">{role}</div>
      </div>
    </div>
  </motion.div>
);

export default function EnhancedLandingPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2847] to-[#0f1b2e] text-white overflow-hidden">
      {/* Background effects */}
      <HeroOrbs />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <Header
        links={[
          { label: 'Features', value: 'features' },
          { label: 'How It Works', value: 'how-it-works' },
          { label: 'Testimonials', value: 'testimonials' }
        ]}
        active={activeSection}
        onSelect={(value) => {
          const element = document.getElementById(value);
          element?.scrollIntoView({ behavior: 'smooth' });
        }}
        onCtaClick={handleGetStarted}
        ctaLabel="Get Started"
      />

      {/* HERO SECTION */}
      <motion.section
        id="hero"
        className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-40"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-sm text-white/80">Create Magical Memories This December</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold leading-none mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">
              Christmas
            </span>
            <span className="block text-white mt-4">
              Magic, Daily
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Create a personalized advent calendar filled with messages, memories, and gifts
            that your children will treasure forever.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full font-semibold text-lg hover:shadow-[0_0_40px_rgba(147,197,253,0.5)] transition-all duration-300 flex items-center gap-2"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              See How It Works
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <StatCard number="25" label="Days of Magic" delay={1.1} />
            <StatCard number="10K+" label="Happy Families" delay={1.2} />
            <StatCard number="100%" label="Made with Love" delay={1.3} />
          </motion.div>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-cyan-300 text-sm uppercase tracking-wider mb-4">Features</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Powerful features to create an unforgettable advent calendar experience
            </p>
          </motion.div>

          {/* Features grid - 3 columns with generous gaps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="25 Days of Joy"
              description="Create unique content for each day of December. Add messages, photos, videos, and special gifts that unlock day by day."
              delay={0.1}
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI-Powered Messages"
              description="Stuck on what to write? Our AI helps generate heartfelt, personalized messages tailored to your child's age and interests."
              delay={0.2}
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Beautiful Templates"
              description="Choose from stunning professionally designed templates or create your own unique style. Every calendar is special."
              delay={0.3}
            />
            <FeatureCard
              icon={<Gift className="w-8 h-8" />}
              title="Digital Gifts"
              description="Include downloadable content, video messages, experience vouchers, or links to online activities your child will love."
              delay={0.4}
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Family Sharing"
              description="Multiple children? Create separate calendars for each. Grandparents can contribute too with shared access."
              delay={0.5}
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Magical Experience"
              description="Delightful animations, interactive elements, and a charming Christmas village create an enchanting daily ritual."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative py-32 px-6 bg-white/5">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-cyan-300 text-sm uppercase tracking-wider mb-4">Simple Process</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Create in Minutes
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Get started with your magical advent calendar in just 3 easy steps
            </p>
          </motion.div>

          {/* Steps - Large grid with whitespace */}
          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                step: '01',
                title: 'Choose a Template',
                description: 'Select from our collection of beautiful templates or start with a blank canvas. Customize colors, fonts, and layout to match your style.'
              },
              {
                step: '02',
                title: 'Add Your Content',
                description: 'Fill each day with messages, photos, and gifts. Use our AI assistant to help craft heartfelt content, or write from the heart.'
              },
              {
                step: '03',
                title: 'Share & Delight',
                description: 'Send your calendar to your children and watch the magic unfold as they unlock a new surprise each day throughout December.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                {/* Step number */}
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300/20 to-purple-300/20 mb-6">
                  {item.step}
                </div>

                {/* Content */}
                <h3 className="text-3xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-white/70 leading-relaxed text-lg">{item.description}</p>

                {/* Connector line (except for last item) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-cyan-300/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-cyan-300 text-sm uppercase tracking-wider mb-4">Testimonials</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Loved by Families
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              See what parents and children are saying about their magical December experience
            </p>
          </motion.div>

          {/* Testimonials grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="My daughter looks forward to opening her advent calendar every single morning. The AI-generated messages are so thoughtful and personal!"
              author="Sarah Johnson"
              role="Mother of two"
              delay={0.1}
            />
            <TestimonialCard
              quote="This is the most meaningful Christmas tradition we've started. The ability to include video messages from grandparents is priceless."
              author="Michael Chen"
              role="Father and grandfather"
              delay={0.2}
            />
            <TestimonialCard
              quote="The templates are gorgeous and so easy to customize. I created three calendars for my kids in less than an hour!"
              author="Emma Williams"
              role="Busy mom"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">
                Start Creating Magic
              </span>
            </h2>
            <p className="text-2xl text-white/70 mb-12 leading-relaxed">
              Join thousands of families creating unforgettable memories this December
            </p>
            <button
              onClick={handleGetStarted}
              className="group px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full font-bold text-xl hover:shadow-[0_0_50px_rgba(147,197,253,0.6)] transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              Get Started Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-white/50 text-sm">
          <p>© 2025 Christmas Village. Made with ❤️ for families everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
