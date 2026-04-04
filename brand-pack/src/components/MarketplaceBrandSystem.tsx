import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationSystem, FloatingNavDots } from './NavigationSystem';
import { FinalBrandSystem } from './FinalBrandSystem';

// ============================================================================
// MARKETPLACE-READY BRAND SYSTEM WRAPPER
// ============================================================================

export function MarketplaceBrandSystem() {
  const [currentSection, setCurrentSection] = useState('hero');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sectionIds = [
    'hero', 'lockups', 'tagline-system', 'icon-mark', 'construction', 'clear-space', 'wordmark',
    'color-system', 'incorrect', 'social-profile-icon', 'social-profile-lockup',
    'cover-photos', 'platform-matrix', 'batch-export', 'qa-audit', 'roadmap',
    'stacked-lockup', 'responsive-logo', 'favicon', 'extended-palette',
    'semantic-colors', 'gradients', 'wcag-contrast', 'typefaces', 'type-scale',
    'type-hierarchy', 'base-grid', 'spacing-tokens', 'layout-grid', 'breakpoints',
    'icon-style', 'photography', 'voice-tone', 'writing', 'terminology',
    'button-system', 'card-system', 'form-elements', 'badges-tags', 'easing',
    'duration', 'transitions', 'business-card', 'linkedin-banner',
    'email-signature', 'social-post', 'proposal-cover',
    'brand-pattern', 'brand-style-guide', 'dtcg-structure', 'token-naming', 'export-formats'
  ];

  // IntersectionObserver for scroll tracking
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setCurrentSection(entry.target.id);
        }
      });
    }, options);

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + \ to toggle nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsNavCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentSection(sectionId);
    }
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsNavCollapsed(prev => !prev);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0B0F]" ref={containerRef}>
      {/* Navigation System */}
      <NavigationSystem
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isCollapsed={isNavCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {/* Floating Nav Dots (collapsed state) */}
      <FloatingNavDots currentSection={currentSection} sections={sectionIds} isCollapsed={isNavCollapsed} />

      {/* Main Content — adjusts padding based on nav state */}
      <div
        className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:pr-0 pr-0"
        style={{
          // Only apply right padding on desktop (lg+)
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .brand-content-area {
              padding-right: ${isNavCollapsed ? 52 : 340}px;
              transition: padding-right 500ms cubic-bezier(0.16, 1, 0.3, 1);
            }
          }
        `}</style>
        <div className="brand-content-area">
          <FinalBrandSystem />
        </div>
      </div>

      {/* Keyboard Navigation Helper */}
      <KeyboardNavigationHelper
        currentSection={currentSection}
        sections={sectionIds}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

function KeyboardNavigationHelper({
  currentSection,
  sections,
  onNavigate,
}: {
  currentSection: string;
  sections: string[];
  onNavigate: (sectionId: string) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = sections.findIndex(s => s === currentSection);
      
      if (e.key === 'ArrowUp' && e.ctrlKey && currentIndex > 0) {
        e.preventDefault();
        onNavigate(sections[currentIndex - 1]);
      } else if (e.key === 'ArrowDown' && e.ctrlKey && currentIndex < sections.length - 1) {
        e.preventDefault();
        onNavigate(sections[currentIndex + 1]);
      }
      
      if (e.key === 'Home' && e.ctrlKey) {
        e.preventDefault();
        onNavigate(sections[0]);
      } else if (e.key === 'End' && e.ctrlKey) {
        e.preventDefault();
        onNavigate(sections[sections.length - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, sections, onNavigate]);

  return null;
}