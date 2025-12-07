import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Calendar, Heart, Star, Gift, Palette, Users, Lock } from 'lucide-react';
import { Button } from './ui/WonderButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage, CardTags, CardTag } from './ui/card';

const features = [
  {
    title: 'Easy Creation',
    description: 'Intuitive tools to craft personalized advent calendars in minutes, not hours.',
    icon: Calendar,
    gradient: 'from-primary-peach to-primary-rose'
  },
  {
    title: 'Beautiful Templates',
    description: 'Professional designs that feel warm and magical. Browse our marketplace for instant inspiration.',
    icon: Palette,
    gradient: 'from-primary-rose to-primary-purple'
  },
  {
    title: 'Magical Experience',
    description: 'Delightful animations and thoughtful interactions that make every unlock special.',
    icon: Sparkles,
    gradient: 'from-secondary-blue to-secondary-indigo'
  }
];

const templates = [
  {
    id: '1',
    title: 'Winter Wonderland',
    description: 'Soft blues and whites with gentle snowfall',
    image: 'https://images.unsplash.com/photo-1544273677-16f12e0ed8b2?w=400&h=300&fit=crop',
    tags: ['Popular', 'Elegant']
  },
  {
    id: '2',
    title: 'Cozy Cabin',
    description: 'Warm earth tones with rustic charm',
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=300&fit=crop',
    tags: ['Warm', 'Family']
  },
  {
    id: '3',
    title: 'Magical Forest',
    description: 'Enchanting greens with woodland creatures',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=300&fit=crop',
    tags: ['Whimsical', 'Nature']
  }
];

const processSteps = [
  {
    number: '01',
    title: 'Choose Your Template',
    description: 'Browse our marketplace and pick a design that matches your family\'s style.',
    icon: Palette
  },
  {
    number: '02',
    title: 'Customize Each Day',
    description: 'Add messages, photos, videos, and gifts for every day of December.',
    icon: Gift
  },
  {
    number: '03',
    title: 'Share with Family',
    description: 'Invite your loved ones to unlock surprises together throughout the season.',
    icon: Heart
  }
];

const testimonials = [
  {
    quote: 'Our kids look forward to unlocking each day. The templates are beautiful and so easy to customize!',
    author: 'Sarah M.',
    role: 'Parent of 3',
    avatar: '👨‍👩‍👧‍👦'
  },
  {
    quote: 'Finally, an advent calendar that feels modern and magical. The template marketplace is incredible.',
    author: 'James K.',
    role: 'First-time user',
    avatar: '⭐'
  },
  {
    quote: 'The perfect blend of tradition and technology. Our family tradition just got an upgrade!',
    author: 'Emily R.',
    role: 'Parent of 2',
    avatar: '🎄'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Soft gradient orbs */}
        <div
          className="absolute -top-48 -right-48 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary-peach), transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -left-32 w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-secondary-blue), transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary-purple), transparent 70%)' }}
        />

        {/* Subtle snowfall (reduced from original) */}
        <div className="snow-layer" data-depth="background">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${16 + Math.random() * 8}s`,
                width: '2px',
                height: '2px'
              }}
            />
          ))}
        </div>

        {/* Pastel butterflies (reduced) */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="butterfly"
            style={{
              top: `${20 + i * 25}%`,
              left: `${10 + i * 30}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: '18s'
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            {/* Logo */}
            <div className="flex justify-center">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-bg-muted shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-peach to-primary-purple">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold gradient-text">Magic Cave Calendars</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary font-display"
                style={{ letterSpacing: '-0.02em' }}
              >
                Create magical moments
                <br />
                <span className="gradient-text">this December</span>
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Build beautiful advent calendars for your family. Choose from stunning templates, customize each day, and create memories that last forever.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/auth')}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Start Your Calendar
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Templates
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary-rose fill-primary-rose" />
                <span>Loved by families</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-text-tertiary" />
                <span>Safe & secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-text-tertiary" />
                <span>Built for parents & kids</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-peach/20 to-accent-lavender/20 text-sm font-medium text-text-primary">
              Why families love it
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary font-display">
              Everything you need
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Simple tools that make creating advent calendars joyful, not overwhelming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card variant="elevated" hover>
                    <CardContent className="pt-8">
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-md mb-6`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-text-primary mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section id="templates" className="relative py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-peach/20 to-accent-lavender/20 text-sm font-medium text-text-primary">
              Template Marketplace
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary font-display">
              Beautiful designs, ready to use
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Browse professionally crafted templates. Apply with one click and customize to your heart's content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card variant="feature" hover>
                  <CardImage src={template.image} alt={template.title} />
                  <CardHeader>
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTags>
                      {template.tags.map(tag => (
                        <CardTag key={tag}>{tag}</CardTag>
                      ))}
                    </CardTags>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/auth')}
                    >
                      Apply Template
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth')}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Browse Marketplace
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-peach/20 to-accent-lavender/20 text-sm font-medium text-text-primary">
              How it works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary font-display">
              Three simple steps
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Create your perfect advent calendar in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Connection line (except for last item) */}
                  {index < processSteps.length - 1 && (
                    <div
                      className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-bg-muted to-transparent -translate-x-4"
                      aria-hidden
                    />
                  )}

                  <div className="text-center space-y-4">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-peach/10 to-primary-purple/10 border-2 border-bg-muted relative">
                      <Icon className="h-10 w-10 text-primary-rose" />
                      <span
                        className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-peach to-primary-rose text-white text-xs font-bold shadow-md"
                      >
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-peach/20 to-accent-lavender/20 text-sm font-medium text-text-primary">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary font-display">
              What families are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="default" className="h-full">
                  <CardContent className="pt-8 space-y-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-primary-rose fill-primary-rose" />
                      ))}
                    </div>
                    <p className="text-text-secondary leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-peach/20 to-accent-lavender/20 text-xl">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {testimonial.author}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-primary-peach/5 via-primary-rose/5 to-primary-purple/5">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary font-display">
              Start creating magic today
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Join families who are making December unforgettable with beautiful advent calendars.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/auth')}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/holiday/showcase')}
              >
                View Showcase
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-bg-muted bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-peach to-primary-purple">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold gradient-text">Magic Cave Calendars</p>
                <p className="text-xs text-text-tertiary">Family Mission Control</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <button
                onClick={() => navigate('/auth')}
                className="hover:text-text-primary transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => navigate('/holiday/showcase')}
                className="hover:text-text-primary transition-colors"
              >
                Showcase
              </button>
              <button
                onClick={() => window.location.href = 'mailto:support@familyadvent.com'}
                className="hover:text-text-primary transition-colors"
              >
                Support
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-bg-muted text-center text-sm text-text-tertiary">
            <p>© {new Date().getFullYear()} Magic Cave Calendars. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
