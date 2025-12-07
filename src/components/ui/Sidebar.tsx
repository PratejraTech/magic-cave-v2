import * as React from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  featured?: boolean;
  disabled?: boolean;
}

export interface SidebarSection {
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  activeItemId?: string;
  onNavigate?: (itemId: string) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      sections,
      activeItemId,
      onNavigate,
      header,
      footer,
      collapsed = false,
      className
    },
    ref
  ) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const handleItemClick = (item: SidebarNavItem) => {
      if (item.disabled) return;

      if (item.onClick) {
        item.onClick();
      }

      if (onNavigate) {
        onNavigate(item.id);
      }

      // Close mobile menu after navigation
      setIsMobileOpen(false);
    };

    const NavItem = ({ item }: { item: SidebarNavItem }) => {
      const isActive = activeItemId === item.id;

      return (
        <button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-rose',
            // Active state
            isActive && [
              'bg-gradient-to-r from-accent-peach/20 to-accent-lavender/20',
              'text-text-primary shadow-sm'
            ],
            // Inactive state
            !isActive && 'text-text-secondary hover:text-text-primary hover:bg-bg-soft',
            // Featured item
            item.featured && !isActive && 'text-primary-rose hover:bg-accent-peach/10',
            // Disabled
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* Icon */}
          {item.icon && (
            <span className={cn('flex-shrink-0', isActive ? 'text-primary-rose' : '')}>
              {item.icon}
            </span>
          )}

          {/* Label */}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-primary-rose text-white text-xs font-semibold">
                  {item.badge}
                </span>
              )}

              {/* Featured indicator */}
              {item.featured && !item.badge && (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </>
          )}
        </button>
      );
    };

    const SidebarContent = () => (
      <div className="flex h-full flex-col">
        {/* Header */}
        {header && (
          <div className="flex-shrink-0 px-4 py-6 border-b border-bg-muted">
            {header}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {/* Section Title */}
              {section.title && !collapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  {section.title}
                </h3>
              )}

              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 px-4 py-6 border-t border-bg-muted">
            {footer}
          </div>
        )}
      </div>
    );

    return (
      <>
        {/* Desktop Sidebar */}
        <aside
          ref={ref}
          className={cn(
            'hidden lg:flex flex-col bg-white border-r border-bg-muted transition-all duration-300',
            collapsed ? 'w-20' : 'w-64',
            className
          )}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          {/* Mobile Overlay */}
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-text-primary/40 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
          )}

          {/* Mobile Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: isMobileOpen ? 0 : '-100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-bg-muted shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>

            <SidebarContent />
          </motion.aside>
        </div>

        {/* Mobile Menu Button (exported separately) */}
        {!isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden fixed bottom-4 left-4 z-30 p-3 rounded-full bg-gradient-to-r from-primary-peach to-primary-rose text-white shadow-gradient"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
