'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Calculator, 
  Search, 
  Star, 
  ArrowRight,
  Shield,
  Zap,
  Receipt,
  Landmark,
  Tag,
  Clock,
  TrendingUp,
  Ruler,
  Binary,
  FileText,
  Type,
  Eraser,
  Code,
  FileCode,
  Lock,
  Fingerprint,
  QrCode,
  Minimize2,
  FileCheck
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { sound } from '@/lib/sound';

export interface ToolItem {
  id: string;
  name: string;
  heroIdentity: string;
  primaryColorName: string;
  hexColor: string;
  badgeBgClass: string;
  badgeTextClass: string;
  borderClass: string;
  shadowClass: string;
  category: 'CALCULATORS' | 'CONVERTERS' | 'TEXT' | 'DEVELOPER' | 'QR' | 'IMAGE' | 'PDF';
  description: string;
  href: string;
  issueNo: string;
  icon: React.ElementType;
}

export const EXACT_18_TOOLS: ToolItem[] = [
  // 01 — PERCENTAGE CALCULATOR
  {
    id: 'percentage',
    name: 'Percentage Calculator',
    heroIdentity: 'THE PERCENTAGE HERO',
    primaryColorName: 'ELECTRIC YELLOW',
    hexColor: '#FFD83D',
    badgeBgClass: 'bg-[#FFD83D]',
    badgeTextClass: 'text-black',
    borderClass: 'border-[#FFD83D]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#FFD83D]',
    category: 'CALCULATORS',
    description: 'Calculate percentage, percentage changes, ratios & lightning calculation bursts.',
    href: '/tools/calculators?tool=percentage',
    issueNo: '#001',
    icon: Calculator,
  },
  // 02 — GST CALCULATOR
  {
    id: 'gst',
    name: 'GST Calculator',
    heroIdentity: 'THE TAX HERO',
    primaryColorName: 'CRIMSON RED',
    hexColor: '#FF3344',
    badgeBgClass: 'bg-[#FF3344]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#FF3344]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#FF3344]',
    category: 'CALCULATORS',
    description: 'India GST (5%, 12%, 18%, 28%) with CGST & SGST invoice breakdown.',
    href: '/tools/calculators?tool=gst',
    issueNo: '#002',
    icon: Receipt,
  },
  // 03 — LOAN CALCULATOR
  {
    id: 'loan',
    name: 'Loan Calculator',
    heroIdentity: 'THE LOAN GUARDIAN',
    primaryColorName: 'ROYAL BLUE',
    hexColor: '#2563EB',
    badgeBgClass: 'bg-[#2563EB]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#2563EB]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#2563EB]',
    category: 'CALCULATORS',
    description: 'Monthly loan EMI breakdown with principal and repayment calendar protection.',
    href: '/tools/calculators?tool=loan',
    issueNo: '#003',
    icon: Landmark,
  },
  // 04 — DISCOUNT & SAVINGS CALCULATOR
  {
    id: 'discount',
    name: 'Discount & Savings Calculator',
    heroIdentity: 'THE SAVINGS HERO',
    primaryColorName: 'BRIGHT ORANGE',
    hexColor: '#FF6B00',
    badgeBgClass: 'bg-[#FF6B00]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#FF6B00]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#FF6B00]',
    category: 'CALCULATORS',
    description: 'Calculate final deal price, store savings percentage & discount bursts.',
    href: '/tools/calculators?tool=discount',
    issueNo: '#004',
    icon: Tag,
  },
  // 05 — AGE & DATE CALCULATOR
  {
    id: 'age',
    name: 'Age & Date Calculator',
    heroIdentity: 'THE TIMEKEEPER',
    primaryColorName: 'VIOLET',
    hexColor: '#8B5CF6',
    badgeBgClass: 'bg-[#8B5CF6]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#8B5CF6]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#8B5CF6]',
    category: 'CALCULATORS',
    description: 'Exact age in years, months, days, hours & time portal date span calculations.',
    href: '/tools/calculators?tool=age',
    issueNo: '#005',
    icon: Clock,
  },
  // 06 — SIP CALCULATOR
  {
    id: 'sip',
    name: 'SIP Calculator',
    heroIdentity: 'THE INVESTMENT HERO',
    primaryColorName: 'EMERALD GREEN',
    hexColor: '#10B981',
    badgeBgClass: 'bg-[#10B981]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#10B981]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#10B981]',
    category: 'CALCULATORS',
    description: 'Project systematic investment returns, wealth growth graphs & future wealth.',
    href: '/tools/calculators?tool=sip',
    issueNo: '#006',
    icon: TrendingUp,
  },
  // 07 — UNIT CONVERTERS
  {
    id: 'units',
    name: 'Unit Converters',
    heroIdentity: 'THE TRANSFORMER',
    primaryColorName: 'TURQUOISE',
    hexColor: '#06B6D4',
    badgeBgClass: 'bg-[#06B6D4]',
    badgeTextClass: 'text-black',
    borderClass: 'border-[#06B6D4]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#06B6D4]',
    category: 'CONVERTERS',
    description: 'Length, Weight, Temp, Data (GB to MB), Speed & Area transformation measurements.',
    href: '/tools/converters?tool=units',
    issueNo: '#007',
    icon: Ruler,
  },
  // 08 — NUMBER SYSTEM CONVERTERS
  {
    id: 'number-sys',
    name: 'Number System Converters',
    heroIdentity: 'THE NUMBER MAGE',
    primaryColorName: 'MAGENTA',
    hexColor: '#EC4899',
    badgeBgClass: 'bg-[#EC4899]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#EC4899]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#EC4899]',
    category: 'CONVERTERS',
    description: 'Convert between Binary, Decimal, Hexadecimal & Octal numeric systems.',
    href: '/tools/converters?tool=number-sys',
    issueNo: '#008',
    icon: Binary,
  },
  // 09 — WORD & CHARACTER COUNTER
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    heroIdentity: 'THE COUNT HERO',
    primaryColorName: 'TEAL',
    hexColor: '#14B8A6',
    badgeBgClass: 'bg-[#14B8A6]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#14B8A6]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#14B8A6]',
    category: 'TEXT',
    description: 'Count words, characters, sentences, paragraphs & estimated reading duration.',
    href: '/tools/text?tool=word-counter',
    issueNo: '#009',
    icon: FileText,
  },
  // 10 — CASE CONVERTER
  {
    id: 'case-converter',
    name: 'Case Converter',
    heroIdentity: 'THE TYPO HERO',
    primaryColorName: 'HOT PINK',
    hexColor: '#F43F5E',
    badgeBgClass: 'bg-[#F43F5E]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#F43F5E]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#F43F5E]',
    category: 'TEXT',
    description: 'Transform UPPERCASE, lowercase, Title Case, camelCase, kebab-case & snake_case.',
    href: '/tools/text?tool=case-converter',
    issueNo: '#010',
    icon: Type,
  },
  // 11 — DUPLICATE & SPACE CLEANER
  {
    id: 'text-cleaner',
    name: 'Duplicate & Space Cleaner',
    heroIdentity: 'THE CLEANER',
    primaryColorName: 'LIME GREEN',
    hexColor: '#84CC16',
    badgeBgClass: 'bg-[#84CC16]',
    badgeTextClass: 'text-black',
    borderClass: 'border-[#84CC16]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#84CC16]',
    category: 'TEXT',
    description: 'Purge duplicate lines, trim extra spaces, strip empty rows & format clean text.',
    href: '/tools/text?tool=text-cleaner',
    issueNo: '#011',
    icon: Eraser,
  },
  // 12 — JSON FORMATTER
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    heroIdentity: 'THE CODE HERO',
    primaryColorName: 'ELECTRIC BLUE',
    hexColor: '#3B82F6',
    badgeBgClass: 'bg-[#3B82F6]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#3B82F6]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#3B82F6]',
    category: 'DEVELOPER',
    description: 'Prettify, validate, minify, format and inspect messy JSON payloads.',
    href: '/tools/developer?tool=json-formatter',
    issueNo: '#012',
    icon: Code,
  },
  // 13 — BASE64
  {
    id: 'base64',
    name: 'Base64',
    heroIdentity: 'THE ENCODER',
    primaryColorName: 'CYAN',
    hexColor: '#00D2FF',
    badgeBgClass: 'bg-[#00D2FF]',
    badgeTextClass: 'text-black',
    borderClass: 'border-[#00D2FF]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#00D2FF]',
    category: 'DEVELOPER',
    description: 'Encode plain text strings or decode UTF-8 Base64 character streams.',
    href: '/tools/developer?tool=base64',
    issueNo: '#013',
    icon: FileCode,
  },
  // 14 — SHA HASH
  {
    id: 'hash',
    name: 'SHA Hash',
    heroIdentity: 'THE HASH GUARDIAN',
    primaryColorName: 'DARK INDIGO',
    hexColor: '#4338CA',
    badgeBgClass: 'bg-[#4338CA]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#4338CA]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#4338CA]',
    category: 'DEVELOPER',
    description: 'Generate cryptographic SHA-256 and MD5 hashes with lock security grids.',
    href: '/tools/developer?tool=hash',
    issueNo: '#014',
    icon: Lock,
  },
  // 15 — UUID GENERATOR
  {
    id: 'uuid',
    name: 'UUID Generator',
    heroIdentity: 'THE IDENTITY HERO',
    primaryColorName: 'GOLD',
    hexColor: '#EAB308',
    badgeBgClass: 'bg-[#EAB308]',
    badgeTextClass: 'text-black',
    borderClass: 'border-[#EAB308]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#EAB308]',
    category: 'DEVELOPER',
    description: 'Generate RFC4122 v4 unique identity strings in bulk with one click.',
    href: '/tools/developer?tool=uuid',
    issueNo: '#015',
    icon: Fingerprint,
  },
  // 16 — QR GENERATOR
  {
    id: 'qr-generator',
    name: 'QR Generator',
    heroIdentity: 'THE SIGNAL HERO',
    primaryColorName: 'DEEP PURPLE',
    hexColor: '#6D28D9',
    badgeBgClass: 'bg-[#6D28D9]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#6D28D9]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#6D28D9]',
    category: 'QR',
    description: 'Custom QR code generation for URLs, Wi-Fi keys, vCards & scanning signal beams.',
    href: '/tools/qr',
    issueNo: '#016',
    icon: QrCode,
  },
  // 17 — IMAGE & PDF SIZE COMPRESSOR
  {
    id: 'image-resizer',
    name: 'Image & PDF Size Compressor',
    heroIdentity: 'THE COMPRESSION HERO',
    primaryColorName: 'CORAL',
    hexColor: '#FF6464',
    badgeBgClass: 'bg-[#FF6464]',
    badgeTextClass: 'text-black',
    borderClass: 'border-[#FF6464]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#FF6464]',
    category: 'IMAGE',
    description: 'Compress images & document files, shrink file dimensions & save storage space.',
    href: '/tools/image',
    issueNo: '#017',
    icon: Minimize2,
  },
  // 18 — PDF TOOLKIT
  {
    id: 'pdf-tools',
    name: 'PDF Toolkit',
    heroIdentity: 'THE DOCUMENT HERO',
    primaryColorName: 'BURGUNDY',
    hexColor: '#800020',
    badgeBgClass: 'bg-[#800020]',
    badgeTextClass: 'text-white',
    borderClass: 'border-[#800020]',
    shadowClass: 'shadow-[4px_4px_0px_0px_#800020]',
    category: 'PDF',
    description: 'Merge, split, inspect, count pages & manage PDF documents privacy-first.',
    href: '/tools/pdf',
    issueNo: '#018',
    icon: FileCheck,
  },
];

function ToolsCatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(storage.getUserState().favorites);
  }, []);

  const toggleFav = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = storage.toggleFavorite(id);
    setFavorites(updated);
    sound.playPop();
  };

  const filteredTools = EXACT_18_TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tool.heroIdentity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || tool.category === selectedCategory || (selectedCategory === 'FAVORITES' && favorites.includes(tool.id));
    return matchesSearch && matchesCat;
  });

  const CATEGORIES = ['ALL', 'FAVORITES', 'CALCULATORS', 'CONVERTERS', 'TEXT', 'DEVELOPER', 'QR', 'IMAGE', 'PDF'];

  return (
    <div className="space-y-8 py-6">
      
      {/* Title Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex items-center gap-2">
          <span className="comic-sticker comic-sticker-yellow">
            EXACT 18 SUPERHERO TOOLS
          </span>
          <span className="text-xs font-mono font-bold bg-[#B9A7FF] comic-border-sm px-2 py-0.5">
            18 UNIQUE COLOR IDENTITIES
          </span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight">
          THE TOOLBOX
        </h1>

        <p className="font-extrabold text-gray-700 text-sm sm:text-base">
          18 tools. 18 characters. 18 colors. Every tool is its own original comic superhero world!
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tool name, identity ('THE PERCENTAGE HERO'), or category..."
            className="comic-input w-full text-sm pl-10"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              sound.playPop();
            }}
            className={`btn-comic text-xs px-3 py-1.5 ${
              selectedCategory === cat ? 'btn-comic-yellow font-black' : 'btn-comic-white'
            }`}
          >
            {cat === 'FAVORITES' ? '⭐ FAVORITES' : cat}
          </button>
        ))}
      </div>

      {/* Tools Grid — 18 Comic Issue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.length === 0 ? (
          <div className="col-span-full bg-white comic-border-lg p-12 text-center font-black space-y-2">
            <div className="text-2xl">🔍 NO TOOLS MATCH YOUR SEARCH</div>
            <p className="text-xs text-gray-600 font-mono">
              Try adjusting your query or category filter.
            </p>
          </div>
        ) : (
          filteredTools.map((tool) => {
            const isFav = favorites.includes(tool.id);
            const IconComp = tool.icon;

            return (
              <Link
                key={tool.id}
                href={tool.href}
                onClick={() => storage.trackRecentTool(tool.id)}
                className="bg-white comic-border-md p-5 space-y-3 flex flex-col justify-between group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-comic-sm hover:shadow-comic-md"
                style={{
                  borderLeftWidth: '6px',
                  borderLeftColor: tool.hexColor,
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`comic-sticker text-[10px] ${tool.badgeBgClass} ${tool.badgeTextClass} border border-black shadow-[1px_1px_0_#000]`}>
                      ⚡ ISSUE {tool.issueNo}
                    </span>
                    <button
                      onClick={(e) => toggleFav(e, tool.id)}
                      className="p-1 hover:scale-125 transition-transform"
                      title={isFav ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-[#FFD83D] text-black stroke-[2]' : 'text-gray-400'}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                      style={{ backgroundColor: tool.hexColor, color: tool.badgeTextClass === 'text-white' ? '#FFFFFF' : '#000000' }}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        {tool.heroIdentity}
                      </div>
                      <h3 className="font-black text-lg tracking-tight group-hover:underline">
                        {tool.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-gray-600 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-2 border-t-2 border-black flex items-center justify-between text-xs font-black text-black group-hover:translate-x-1 transition-transform">
                  <span className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block border border-black" 
                      style={{ backgroundColor: tool.hexColor }} 
                    />
                    <span>OPEN ISSUE {tool.issueNo}</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })
        )}
      </div>

    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center font-black text-xl">
        ⚡ LOADING THE TOOLBOX...
      </div>
    }>
      <ToolsCatalogContent />
    </Suspense>
  );
}
