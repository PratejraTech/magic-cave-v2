/**
 * Component Testing Page
 * Visual verification of new design system components
 */

import { useState } from 'react';
import { Sparkles, Mail, Lock, Search } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardTags,
  CardTag,
  CardStat,
  CardStatLabel,
  CardStatValue,
  CardStatChange,
  Input,
  Textarea,
  Select,
  Toggle
} from './components/ui';

export default function TestComponents() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <div className="min-h-screen bg-bg-soft p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-2 gradient-text">
            Design System Component Library
          </h1>
          <p className="text-text-secondary">
            OpenAI/Anthropic inspired UI components
          </p>
        </div>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="primary" leftIcon={<Sparkles className="h-4 w-4" />}>
              With Icon
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>Loading...</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div className="flex gap-4">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Cards</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  Standard card with soft shadow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary text-sm">
                  This is the default card variant with clean styling.
                </p>
              </CardContent>
            </Card>

            {/* Feature Card */}
            <Card variant="feature" hover>
              <CardImage src="https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=400&h=225&fit=crop" alt="Template" />
              <CardHeader>
                <CardTitle>Feature Card</CardTitle>
                <CardDescription>
                  For template marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTags>
                  <CardTag>Modern</CardTag>
                  <CardTag>Gradient</CardTag>
                </CardTags>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Apply Template</Button>
              </CardFooter>
            </Card>

            {/* Stats Card */}
            <Card variant="stats">
              <CardHeader>
                <CardTitle>Stats Card</CardTitle>
                <CardDescription>
                  Dashboard metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardStat>
                  <CardStatLabel>Total Templates</CardStatLabel>
                  <CardStatValue>24</CardStatValue>
                  <CardStatChange positive>+12% this month</CardStatChange>
                </CardStat>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Form Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                hint="We'll never share your email"
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                required
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Input
                label="Search"
                type="text"
                placeholder="Search templates..."
                leftIcon={<Search className="h-4 w-4" />}
              />

              <Input
                label="Error Example"
                type="text"
                placeholder="Invalid input"
                error="This field has an error"
              />
            </div>

            {/* Textarea, Select, Toggle */}
            <div className="space-y-4">
              <Textarea
                label="Message"
                placeholder="Tell us about your calendar..."
                rows={4}
                maxLength={200}
                showCharCount
                hint="Describe your ideal calendar theme"
              />

              <Select
                label="Template Style"
                placeholder="Select a style..."
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { value: 'modern', label: 'Modern & Clean' },
                  { value: 'whimsical', label: 'Whimsical & Playful' },
                  { value: 'elegant', label: 'Elegant & Refined' },
                  { value: 'minimal', label: 'Minimal & Simple' }
                ]}
              />

              <Toggle
                label="Enable Notifications"
                description="Receive daily reminders for calendar updates"
                checked={toggleValue}
                onChange={setToggleValue}
              />

              <Toggle
                label="Dark Mode"
                description="Switch to dark theme"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Color Palette</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-gradient-to-r from-primary-peach via-primary-rose to-primary-purple shadow-gradient" />
              <p className="text-sm font-medium">Primary Gradient</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-gradient-to-r from-secondary-blue via-secondary-indigo to-secondary-pink shadow-md" />
              <p className="text-sm font-medium">Secondary Gradient</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-gradient-to-br from-accent-peach to-accent-lavender shadow-sm" />
              <p className="text-sm font-medium">Accent Gradient</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-gradient-to-br from-magic-primary via-magic-secondary to-magic-accent shadow-magical" />
              <p className="text-sm font-medium">Magic Gradient (Child UI)</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Typography</h2>
          <div className="space-y-2">
            <p className="text-4xl font-bold font-display text-text-primary">
              Display Font - Plus Jakarta Sans
            </p>
            <p className="text-2xl font-semibold text-text-primary">
              Heading Font - Inter
            </p>
            <p className="text-base text-text-primary">
              Body text with default sizing and spacing
            </p>
            <p className="text-sm text-text-secondary">
              Secondary text with muted color
            </p>
            <p className="text-xs text-text-tertiary">
              Tertiary text for captions and hints
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
