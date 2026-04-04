import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronRight, ChevronLeft, Download, Menu, X, Check, ExternalLink, PanelRightClose, PanelRightOpen } from 'lucide-react';

// ============================================================================
// PROFESSIONAL NAVIGATION SYSTEM — COLLAPSIBLE SIDEBAR
// ============================================================================

interface Section {
  id: string;
  num: string;
  title: string;
  category: string;
  keywords: string[];
}

const SECTIONS: Section[] = [
  // Foundation
  { id: 'hero', num: '00', title: 'Brand Overview', category: 'Foundation', keywords: ['logo', 'intro', 'hero'] },
  { id: 'lockups', num: '01', title: 'Logo Lockups', category: 'Foundation', keywords: ['logo', 'horizontal', 'primary'] },
  { id: 'tagline-system', num: '01b', title: 'Tagline System', category: 'Foundation', keywords: ['tagline', 'slogan', 'systems in motion'] },
  { id: 'icon-mark', num: '02', title: 'Icon Mark', category: 'Foundation', keywords: ['icon', 'mark', 'standalone', 'app icon'] },
  { id: 'construction', num: '03', title: 'Construction', category: 'Foundation', keywords: ['geometry', 'grid', 'structure', 'technical'] },
  { id: 'clear-space', num: '04', title: 'Clear Space', category: 'Foundation', keywords: ['spacing', 'clearance', 'padding'] },
  { id: 'wordmark', num: '05', title: 'Wordmark', category: 'Foundation', keywords: ['typography', 'text', 'logotype'] },
  { id: 'color-system', num: '06', title: 'Color System', category: 'Foundation', keywords: ['colors', 'palette', 'primary'] },
  { id: 'incorrect', num: '07', title: 'Incorrect Usage', category: 'Foundation', keywords: ['dont', 'mistakes', 'errors', 'wrong'] },
  
  // Social Media
  { id: 'social-profile-icon', num: '08', title: 'Social Profile (Icon)', category: 'Social Media', keywords: ['social', 'avatar', 'profile', 'icon'] },
  { id: 'social-profile-lockup', num: '09', title: 'Social Profile (Lockup)', category: 'Social Media', keywords: ['social', 'profile', 'lockup'] },
  { id: 'cover-photos', num: '10', title: 'Cover Photos', category: 'Social Media', keywords: ['banner', 'header', 'cover'] },
  { id: 'platform-matrix', num: '11', title: 'Platform Matrix', category: 'Social Media', keywords: ['sizes', 'dimensions', 'specs'] },
  { id: 'batch-export', num: '12', title: 'Batch Export', category: 'Social Media', keywords: ['download', 'export', 'assets'] },
  
  // Extended System
  { id: 'qa-audit', num: '13', title: 'QA Audit', category: 'Quality', keywords: ['audit', 'checklist', 'quality', 'review'] },
  { id: 'roadmap', num: '14', title: 'System Roadmap', category: 'Overview', keywords: ['overview', 'structure', 'phases'] },
  { id: 'stacked-lockup', num: '15', title: 'Stacked Lockup', category: 'Logo Variants', keywords: ['vertical', 'stacked', 'square'] },
  { id: 'responsive-logo', num: '16', title: 'Responsive Logo', category: 'Logo Variants', keywords: ['responsive', 'adaptive', 'breakpoints'] },
  { id: 'favicon', num: '17', title: 'Favicon & App Icon', category: 'Logo Variants', keywords: ['favicon', 'app icon', 'ios', 'android'] },
  
  // Colors
  { id: 'extended-palette', num: '18', title: 'Extended Palette', category: 'Colors', keywords: ['colors', 'shades', 'tints'] },
  { id: 'semantic-colors', num: '19', title: 'Semantic Colors', category: 'Colors', keywords: ['semantic', 'success', 'error', 'warning'] },
  { id: 'gradients', num: '20', title: 'Gradient System', category: 'Colors', keywords: ['gradients', 'effects'] },
  { id: 'wcag-contrast', num: '21', title: 'WCAG Contrast', category: 'Colors', keywords: ['accessibility', 'contrast', 'wcag', 'a11y'] },
  
  // Typography
  { id: 'typefaces', num: '22', title: 'Brand Typefaces', category: 'Typography', keywords: ['fonts', 'typeface', 'family'] },
  { id: 'type-scale', num: '23', title: 'Type Scale', category: 'Typography', keywords: ['scale', 'sizes', 'hierarchy'] },
  { id: 'type-hierarchy', num: '24', title: 'Type Hierarchy', category: 'Typography', keywords: ['hierarchy', 'examples', 'usage'] },
  
  // Spacing & Layout
  { id: 'base-grid', num: '25', title: '4px Base Grid', category: 'Spacing', keywords: ['grid', 'baseline', 'spacing'] },
  { id: 'spacing-tokens', num: '26', title: 'Spacing Tokens', category: 'Spacing', keywords: ['spacing', 'tokens', 'scale'] },
  { id: 'layout-grid', num: '27', title: 'Layout Grid', category: 'Spacing', keywords: ['layout', 'columns', 'grid'] },
  { id: 'breakpoints', num: '28', title: 'Breakpoints', category: 'Spacing', keywords: ['responsive', 'breakpoints', 'media queries'] },
  
  // Iconography
  { id: 'icon-style', num: '29', title: 'Icon Style Guide', category: 'Iconography', keywords: ['icons', 'style', 'design'] },
  { id: 'photography', num: '30', title: 'Photography Guidelines', category: 'Iconography', keywords: ['photos', 'images', 'photography'] },
  
  // Brand Voice
  { id: 'voice-tone', num: '31', title: 'Voice & Tone', category: 'Brand Voice', keywords: ['voice', 'tone', 'personality'] },
  { id: 'writing', num: '32', title: 'Writing Guidelines', category: 'Brand Voice', keywords: ['writing', 'copy', 'content'] },
  { id: 'terminology', num: '33', title: 'Terminology', category: 'Brand Voice', keywords: ['terms', 'language', 'vocabulary'] },
  
  // UI Components
  { id: 'button-system', num: '34', title: 'Button System', category: 'Components', keywords: ['buttons', 'cta', 'components'] },
  { id: 'card-system', num: '35', title: 'Card System', category: 'Components', keywords: ['cards', 'containers'] },
  { id: 'form-elements', num: '36', title: 'Form Elements', category: 'Components', keywords: ['forms', 'inputs', 'fields'] },
  { id: 'badges-tags', num: '37', title: 'Badges & Tags', category: 'Components', keywords: ['badges', 'tags', 'labels'] },
  
  // Motion
  { id: 'easing', num: '38', title: 'Easing Curves', category: 'Motion', keywords: ['easing', 'animation', 'curves'] },
  { id: 'duration', num: '39', title: 'Duration Tokens', category: 'Motion', keywords: ['duration', 'timing', 'speed'] },
  { id: 'transitions', num: '40', title: 'Transition Patterns', category: 'Motion', keywords: ['transitions', 'animations', 'patterns'] },
  
  // Applications
  { id: 'business-card', num: '41', title: 'Business Card', category: 'Applications', keywords: ['business card', 'print', 'stationery'] },
  { id: 'linkedin-banner', num: '41b', title: 'LinkedIn Banner', category: 'Applications', keywords: ['linkedin', 'banner', 'cover', 'social'] },
  { id: 'email-signature', num: '42', title: 'Email Signature', category: 'Applications', keywords: ['email', 'signature'] },
  { id: 'social-post', num: '42b', title: 'Social Post Template', category: 'Applications', keywords: ['social', 'post', 'instagram', 'announcement'] },
  { id: 'proposal-cover', num: '42c', title: 'Proposal Cover', category: 'Applications', keywords: ['proposal', 'document', 'cover', 'A4'] },
  { id: 'brand-pattern', num: '43', title: 'Brand Pattern Tile', category: 'Applications', keywords: ['pattern', 'texture', 'tile', 'hex'] },
  
  // Style Guide
  { id: 'brand-style-guide', num: '50', title: 'Brand Style Guide', category: 'Reference', keywords: ['style guide', 'reference', 'summary', 'rules', 'guidelines'] },

  // Tokens
  { id: 'dtcg-structure', num: '45', title: 'DTCG Token Structure', category: 'Design Tokens', keywords: ['tokens', 'dtcg', 'structure'] },
  { id: 'token-naming', num: '46', title: 'Token Naming', category: 'Design Tokens', keywords: ['naming', 'conventions', 'tokens'] },
  { id: 'export-formats', num: '47', title: 'Export Formats', category: 'Design Tokens', keywords: ['export', 'formats', 'json', 'css'] },
];

const CATEGORIES = Array.from(new Set(SECTIONS.map(s => s.category)));

// Group sections by category for the sidebar
const GROUPED = CATEGORIES.map(cat => ({
  category: cat,
  sections: SECTIONS.filter(s => s.category === cat),
}));

interface NavigationSystemProps {
  currentSection: string;
  onNavigate: (sectionId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function NavigationSystem({ currentSection, onNavigate, isCollapsed, onToggleCollapse }: NavigationSystemProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const activeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const filteredSections = searchQuery
    ? SECTIONS.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : null; // null = show grouped view

  const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / SECTIONS.length) * 100 : 0;

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeRef.current && listRef.current && !searchQuery) {
      const listRect = listRef.current.getBoundingClientRect();
      const itemRect = activeRef.current.getBoundingClientRect();
      if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentSection, searchQuery]);

  return (
    <>
      {/* ─── MOBILE TOGGLE ─── */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-5 right-5 z-[60] lg:hidden bg-[#111218]/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors"
        aria-label="Toggle navigation"
      >
        {isMobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
      </button>

      {/* ─── MOBILE OVERLAY ─── */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[49] lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* ─── DESKTOP: COLLAPSED RAIL ─── */}
      <div
        className={`
          hidden lg:flex fixed top-0 right-0 h-full z-40 flex-col items-center
          bg-[#08090D]/80 backdrop-blur-xl border-l border-white/[0.04]
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isCollapsed ? 'w-[52px] opacity-100 pointer-events-auto' : 'w-[52px] opacity-0 pointer-events-none'}
        `}
      >
        {/* Toggle open */}
        <button
          onClick={onToggleCollapse}
          className="mt-5 p-2.5 rounded-lg hover:bg-white/[0.06] transition-colors group"
          aria-label="Open navigation"
          title="Open sidebar (⌘ + \)"
        >
          <PanelRightOpen size={16} className="text-white/40 group-hover:text-white/70 transition-colors" />
        </button>

        {/* Mini progress rail */}
        <div className="mt-4 w-px flex-1 mx-auto bg-white/[0.04] relative rounded-full overflow-hidden">
          <div
            className="w-full bg-[#2563EB]/60 rounded-full transition-all duration-700"
            style={{ height: `${progress}%` }}
          />
        </div>

        {/* Mini dot indicators */}
        <div className="py-3 flex flex-col gap-[3px] items-center">
          {GROUPED.map((g) => (
            <button
              key={g.category}
              onClick={() => onNavigate(g.sections[0].id)}
              className="group relative"
              title={g.category}
            >
              <div
                className={`w-[5px] h-[5px] rounded-full transition-all duration-300 ${
                  g.sections.some(s => s.id === currentSection)
                    ? 'bg-[#3B82F6] scale-150'
                    : 'bg-white/15 hover:bg-white/30'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mb-5" />
      </div>

      {/* ─── FULL SIDEBAR (Desktop expanded + Mobile drawer) ─── */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50
          bg-[#08090D]/[0.97] backdrop-blur-2xl border-l border-white/[0.06]
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          w-[340px]
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
          ${!isCollapsed ? 'lg:translate-x-0' : 'lg:translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* ── Header ── */}
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                <span className="text-white/80" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  Contents
                </span>
                <span className="text-white/25 font-mono" style={{ fontSize: 10 }}>
                  {currentIndex + 1}/{SECTIONS.length}
                </span>
              </div>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 rounded-lg hover:bg-white/[0.06] transition-colors group"
                aria-label="Collapse sidebar"
                title="Close sidebar (⌘ + \)"
              >
                <PanelRightClose size={15} className="text-white/30 group-hover:text-white/60 transition-colors" />
              </button>
            </div>

            {/* Progress */}
            <div className="w-full h-[3px] bg-white/[0.04] rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #1E40AF, #3B82F6, #60A5FA)',
                }}
              />
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-8 py-2 text-white/90 placeholder:text-white/25 focus:bg-white/[0.05] focus:border-[#2563EB]/30 outline-none transition-all"
                style={{ fontSize: 12 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <X size={12} className="text-white/30" />
                </button>
              )}
            </div>
          </div>

          {/* ── Section List ── */}
          <div className="flex-1 overflow-y-auto py-2 px-2" ref={listRef}>
            {filteredSections ? (
              // Search results — flat list
              filteredSections.length === 0 ? (
                <div className="text-center py-10 text-white/25" style={{ fontSize: 12 }}>
                  No sections match "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-0.5 px-1">
                  {filteredSections.map((section) => (
                    <NavItem
                      key={section.id}
                      section={section}
                      isActive={currentSection === section.id}
                      ref={currentSection === section.id ? activeRef : null}
                      onClick={() => {
                        onNavigate(section.id);
                        setIsMobileOpen(false);
                      }}
                    />
                  ))}
                </div>
              )
            ) : (
              // Grouped view
              <div className="space-y-1">
                {GROUPED.map((group) => (
                  <div key={group.category}>
                    <div className="px-3 pt-3 pb-1">
                      <span className="text-white/20" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>
                        {group.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-px">
                      {group.sections.map((section) => (
                        <NavItem
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          ref={currentSection === section.id ? activeRef : null}
                          onClick={() => {
                            onNavigate(section.id);
                            setIsMobileOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-4 py-3 border-t border-white/[0.06]">
            <button className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg px-4 py-2.5 transition-colors">
              <Download size={13} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Export All Assets</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Nav Item ──
const NavItem = React.forwardRef<
  HTMLButtonElement,
  { section: Section; isActive: boolean; onClick: () => void }
>(({ section, isActive, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={`
      w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left transition-all duration-200
      ${isActive
        ? 'bg-[#2563EB]/12'
        : 'hover:bg-white/[0.03]'
      }
    `}
  >
    <span
      className={`flex-shrink-0 font-mono ${isActive ? 'text-[#60A5FA]' : 'text-white/15'}`}
      style={{ fontSize: 9, fontWeight: 600, width: 16 }}
    >
      {section.num}
    </span>
    <span
      className={`flex-1 truncate ${isActive ? 'text-white/95' : 'text-white/50'}`}
      style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, letterSpacing: '-0.01em' }}
    >
      {section.title}
    </span>
    {isActive && (
      <div className="w-1 h-1 rounded-full bg-[#3B82F6] flex-shrink-0" />
    )}
  </button>
));
NavItem.displayName = 'NavItem';

// ── Floating Nav Dots — only shown when sidebar is collapsed ──
export function FloatingNavDots({ currentSection, sections, isCollapsed }: { currentSection: string; sections: string[]; isCollapsed: boolean }) {
  if (!isCollapsed) return null;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-1.5 z-30">
      {sections.map((sectionId, index) => (
        <button
          key={sectionId}
          onClick={() => scrollToSection(sectionId)}
          className="group relative"
          aria-label={`Go to section ${index + 1}`}
        >
          <div
            className={`
              w-1.5 h-1.5 rounded-full transition-all duration-300
              ${currentSection === sectionId
                ? 'bg-[#3B82F6] scale-[1.8]'
                : 'bg-white/15 hover:bg-white/35 hover:scale-125'
              }
            `}
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 bg-[#111218]/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <span className="text-white/80" style={{ fontSize: 11, fontWeight: 500 }}>
              {String(index + 1).padStart(2, '0')} · {SECTIONS[index]?.title || `Section ${index + 1}`}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}