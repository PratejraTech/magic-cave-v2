/**
 * Enhanced Landing Page - Production-Ready Marketing Page
 * Features: Modern grid layout, generous whitespace, micro UI components
 * Maxim whitespace principle with enticing, inspiring design
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Gift, Star, Calendar, Users } from 'lucide-react';
import Header from '../components/Header';
import { ChristmasOrnament, ChristmasTree, Snowflake } from '../components/decorative';
import { PRICING_TIERS } from '../lib/stripe/config';
import { initiateCheckout } from '../lib/stripe/client';

// Hero gradient orbs for depth - Christmas Edition
const HeroOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, rgba(4, 120, 87, 0.3), transparent 70%)',
        filter: 'blur(80px)'
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1]
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
        background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25), transparent 70%)',
        filter: 'blur(80px)'
      }}
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.15, 0.25, 0.15]
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
        background: 'radial-gradient(circle, rgba(153, 27, 27, 0.25), transparent 70%)',
        filter: 'blur(80px)'
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.08, 0.15, 0.08]
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
    className="group relative bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl p-8 hover:bg-white hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -8, scale: 1.02 }}
  >
    {/* Icon with gradient background */}
    <motion.div
      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
      whileHover={{ rotate: 5 }}
    >
      <div className="text-emerald-700">{icon}</div>
    </motion.div>

    {/* Title */}
    <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
      {title}
    </h3>

    {/* Description */}
    <p className="text-slate-600 leading-relaxed">
      {description}
    </p>

    {/* Hover glow effect */}
    <motion.div
      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(4,120,87,0.08), transparent 70%)'
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
      className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-700 via-red-700 to-amber-600 bg-clip-text text-transparent mb-2"
      whileHover={{ scale: 1.1 }}
    >
      {number}
    </motion.div>
    <div className="text-slate-600 text-sm uppercase tracking-wider font-semibold">{label}</div>
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
    className="bg-white/90 backdrop-blur-md border border-emerald-100 rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
  >
    {/* Quote icon */}
    <div className="text-6xl text-emerald-200 mb-4">"</div>

    {/* Quote text */}
    <p className="text-slate-700 text-lg leading-relaxed mb-6 italic">
      {quote}
    </p>

    {/* Author */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400" />
      <div>
        <div className="text-slate-800 font-semibold">{author}</div>
        <div className="text-slate-600 text-sm">{role}</div>
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

  const handlePurchase = async (tierId: 'basic' | 'premium' | 'deluxe') => {
    const tier = PRICING_TIERS.find(t => t.id === tierId);
    if (!tier) return;

    try {
      await initiateCheckout({
        priceId: tier.priceId,
        tierId: tier.id,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Sorry, there was an error starting checkout. Please try again or contact support.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#ffffff] to-[#f0fdf4] text-[#1e293b] overflow-hidden">
      {/* Background effects */}
      <HeroOrbs />

      {/* Christmas Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ornaments */}
        <div className="absolute top-20 left-[10%] opacity-20">
          <ChristmasOrnament color="burgundy" size="lg" />
        </div>
        <div className="absolute top-[40%] right-[8%] opacity-15">
          <ChristmasOrnament color="emerald" size="md" />
        </div>
        <div className="absolute bottom-[30%] left-[5%] opacity-15">
          <ChristmasOrnament color="gold" size="sm" />
        </div>

        {/* Christmas Trees */}
        <div className="absolute top-[25%] right-[15%] opacity-10">
          <ChristmasTree size="lg" />
        </div>
        <div className="absolute bottom-[20%] right-[5%] opacity-12">
          <ChristmasTree size="md" />
        </div>

        {/* Snowflakes */}
        <div className="absolute top-[15%] left-[20%] text-emerald-300">
          <Snowflake size="lg" variant="1" delay={0} />
        </div>
        <div className="absolute top-[50%] left-[15%] text-blue-200">
          <Snowflake size="md" variant="2" delay={1} />
        </div>
        <div className="absolute top-[35%] right-[25%] text-slate-300">
          <Snowflake size="sm" variant="3" delay={2} />
        </div>
        <div className="absolute bottom-[40%] right-[12%] text-emerald-200">
          <Snowflake size="md" variant="1" delay={1.5} />
        </div>
        <div className="absolute bottom-[15%] left-[25%] text-blue-300">
          <Snowflake size="lg" variant="2" delay={0.5} />
        </div>
      </div>

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
          { label: 'Pricing', value: 'pricing' },
          { label: 'Testimonials', value: 'testimonials' }
        ]}
        active={activeSection}
        onSelect={(value) => {
          const element = document.getElementById(value);
          element?.scrollIntoView({ behavior: 'smooth' });
        }}
        onCtaClick={handleGetStarted}
        ctaLabel="Buy Now"
        variant="light"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 backdrop-blur-md border border-emerald-200 rounded-full mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-800 font-medium">Create Magical Memories This December</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold leading-none mb-8 font-display"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-red-700 to-amber-600">
              Christmas
            </span>
            <span className="block text-slate-800 mt-4">
              Magic, Daily
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed"
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
              className="group px-8 py-4 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white rounded-full font-semibold text-lg hover:shadow-[0_8px_30px_rgba(153,27,27,0.4)] transition-all duration-300 flex items-center gap-2"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-700 rounded-full font-semibold text-lg hover:bg-emerald-50 transition-all duration-300"
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
            <p className="text-emerald-600 text-sm uppercase tracking-wider mb-4 font-semibold">Features</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-display">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
      <section id="how-it-works" className="relative py-32 px-6 bg-emerald-50/30">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-emerald-600 text-sm uppercase tracking-wider mb-4 font-semibold">Simple Process</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-display">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
                Create in Minutes
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-200/80 to-amber-200/80 mb-6 font-display">
                  {item.step}
                </div>

                {/* Content */}
                <h3 className="text-3xl font-bold text-slate-800 mb-4 font-display">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{item.description}</p>

                {/* Connector line (except for last item) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-emerald-300/40 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-emerald-600 text-sm uppercase tracking-wider mb-4 font-semibold">Simple Pricing</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-display">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
                One-Time Purchase
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              No subscriptions. Pay once, use forever. Perfect for gifting this Christmas season.
            </p>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Tier */}
            <motion.div
              className="relative bg-white border-2 border-emerald-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2 font-display">Basic</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-emerald-700">$19</span>
                  <span className="text-slate-500">one-time</span>
                </div>
                <p className="text-slate-600">Perfect for one child</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-slate-700">1 advent calendar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-slate-700">Beautiful templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-slate-700">Photo & text uploads</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-slate-700">Magical animations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-slate-700">Lifetime access</span>
                </li>
              </ul>
              <button
                onClick={() => handlePurchase('basic')}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors duration-300"
              >
                Buy Now
              </button>
            </motion.div>

            {/* Advanced AI Tier - POPULAR */}
            <motion.div
              className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 border-2 border-emerald-600 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ y: -12, scale: 1.02 }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">
                MOST POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2 font-display">Advanced AI</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-white">$39</span>
                  <span className="text-emerald-100">one-time</span>
                </div>
                <p className="text-emerald-50">Perfect for families</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-amber-300 mt-1">✓</span>
                  <span className="text-white font-medium">3 advent calendars</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-300 mt-1">✓</span>
                  <span className="text-white">All templates + exclusives</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-300 mt-1">✓</span>
                  <span className="text-white">AI-powered messages</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-300 mt-1">✓</span>
                  <span className="text-white">Video message uploads</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-300 mt-1">✓</span>
                  <span className="text-white">Priority email support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-300 mt-1">✓</span>
                  <span className="text-white">Lifetime access</span>
                </li>
              </ul>
              <button
                onClick={() => handlePurchase('premium')}
                className="w-full px-6 py-3 bg-white text-emerald-700 rounded-full font-bold hover:bg-amber-50 transition-colors duration-300"
              >
                Buy Now
              </button>
            </motion.div>

            {/* Custom Family Tier */}
            <motion.div
              className="relative bg-white border-2 border-amber-300 rounded-3xl p-8 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2 font-display">Custom Family</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-amber-600">$99</span>
                  <span className="text-slate-500">one-time</span>
                </div>
                <p className="text-slate-600">For the whole family</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span className="text-slate-700 font-medium">10 advent calendars</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span className="text-slate-700">Custom template design</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span className="text-slate-700">Premium AI assistance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span className="text-slate-700">Video & audio uploads</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span className="text-slate-700">Dedicated family support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span className="text-slate-700">Gift voucher codes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span className="text-slate-700">Lifetime access</span>
                </li>
              </ul>
              <button
                onClick={() => handlePurchase('deluxe')}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold hover:from-amber-600 hover:to-amber-700 transition-colors duration-300"
              >
                Buy Custom Family
              </button>
            </motion.div>
          </div>

          {/* Money-back guarantee */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-slate-600 text-lg">
              <span className="text-emerald-600 font-semibold">✓</span> 30-day money-back guarantee ·
              <span className="text-emerald-600 font-semibold"> ✓</span> No hidden fees ·
              <span className="text-emerald-600 font-semibold"> ✓</span> Secure payment
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT PREVIEW SECTION */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-slate-900 to-emerald-900">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-emerald-300 text-sm uppercase tracking-wider mb-4 font-semibold">See It In Action</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-display text-white">
              The Magical Experience
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Watch your child's face light up as they explore our enchanting Christmas village
            </p>
          </motion.div>

          {/* Preview Image/Demo */}
          <motion.div
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {/* Preview Container */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 aspect-video flex items-center justify-center">
              {/* Simulated Village Scene */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Background Stars */}
                <div className="absolute inset-0">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </div>

                {/* Decorative Trees */}
                <div className="absolute bottom-20 left-1/4">
                  <ChristmasTree size="lg" />
                </div>
                <div className="absolute bottom-20 right-1/4">
                  <ChristmasTree size="lg" />
                </div>

                {/* Center Message */}
                <div className="relative z-10 text-center px-6">
                  <motion.div
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-2xl mx-auto"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
                      Interactive Village
                    </h3>
                    <p className="text-xl text-white/80 mb-6">
                      Each day reveals a new surprise in our magical Christmas village
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-white/70">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏠</span>
                        <span>25 Houses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">❄️</span>
                        <span>Snowfall</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🦋</span>
                        <span>Butterflies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <span>Northern Lights</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Snowflakes */}
                <div className="absolute top-10 left-10">
                  <Snowflake size="lg" variant="1" delay={0} />
                </div>
                <div className="absolute top-20 right-20">
                  <Snowflake size="md" variant="2" delay={1} />
                </div>
                <div className="absolute bottom-32 left-1/3">
                  <Snowflake size="sm" variant="3" delay={2} />
                </div>
              </div>

              {/* Play Button Overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255, 255, 255, 0.4)',
                      '0 0 0 20px rgba(255, 255, 255, 0)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                </motion.div>
              </motion.div>
            </div>

            {/* Feature Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold">
                🎨 Fully Customizable
              </div>
              <div className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-semibold">
                📱 Mobile Friendly
              </div>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: '🎭', title: 'Animated Scenes', desc: 'Delightful animations bring the village to life' },
              { icon: '📸', title: 'Photo Memories', desc: 'Upload photos and videos for each day' },
              { icon: '🎵', title: 'Sound Effects', desc: 'Optional festive music and sounds' }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-emerald-200">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
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
            <p className="text-emerald-600 text-sm uppercase tracking-wider mb-4 font-semibold">Testimonials</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-display">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
                Loved by Families
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
      <section className="relative py-40 px-6 bg-emerald-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 font-display">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-red-700 to-amber-600">
                Start Creating Magic
              </span>
            </h2>
            <p className="text-2xl text-slate-600 mb-12 leading-relaxed">
              Join thousands of families creating unforgettable memories this December
            </p>
            <button
              onClick={handleGetStarted}
              className="group px-12 py-5 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white rounded-full font-bold text-xl hover:shadow-[0_8px_40px_rgba(153,27,27,0.5)] transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-emerald-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2025 Christmas Village. Made with ❤️ for families everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
