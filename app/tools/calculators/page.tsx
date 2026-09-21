'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calculator, ArrowLeft, Copy, Check, Receipt, Landmark, Tag, Clock, TrendingUp } from 'lucide-react';
import { sound } from '@/lib/sound';

const TOOL_THEMES = {
  percentage: {
    name: 'Percentage Calculator',
    heroIdentity: 'THE PERCENTAGE HERO',
    issueNo: '#001',
    hexColor: '#FFD83D',
    bgColorClass: 'bg-[#FFD83D]',
    textColorClass: 'text-black',
    borderClass: 'border-[#FFD83D]',
    tagline: '"FAST MATHEMATICAL SUPERHERO — CRUNCH THE NUMBERS."',
    icon: Calculator,
  },
  gst: {
    name: 'GST Calculator',
    heroIdentity: 'THE TAX HERO',
    issueNo: '#002',
    hexColor: '#FF3344',
    bgColorClass: 'bg-[#FF3344]',
    textColorClass: 'text-white',
    borderClass: 'border-[#FF3344]',
    tagline: '"FINANCIAL GUARDIAN — LET\'S SETTLE THE TAX."',
    icon: Receipt,
  },
  loan: {
    name: 'Loan Calculator',
    heroIdentity: 'THE LOAN GUARDIAN',
    issueNo: '#003',
    hexColor: '#2563EB',
    bgColorClass: 'bg-[#2563EB]',
    textColorClass: 'text-white',
    borderClass: 'border-[#2563EB]',
    tagline: '"STRONG FINANCIAL PROTECTOR — SECURE YOUR REPAYMENT PLAN."',
    icon: Landmark,
  },
  discount: {
    name: 'Discount & Savings Calculator',
    heroIdentity: 'THE SAVINGS HERO',
    issueNo: '#004',
    hexColor: '#FF6B00',
    bgColorClass: 'bg-[#FF6B00]',
    textColorClass: 'text-white',
    borderClass: 'border-[#FF6B00]',
    tagline: '"FAST DEAL-FINDING SUPERHERO — MAXIMIZE YOUR SAVINGS."',
    icon: Tag,
  },
  age: {
    name: 'Age & Date Calculator',
    heroIdentity: 'THE TIMEKEEPER',
    issueNo: '#005',
    hexColor: '#8B5CF6',
    bgColorClass: 'bg-[#8B5CF6]',
    textColorClass: 'text-white',
    borderClass: 'border-[#8B5CF6]',
    tagline: '"TIME-MANIPULATING COMIC HERO — MASTER EVERY SECOND."',
    icon: Clock,
  },
  sip: {
    name: 'SIP Calculator',
    heroIdentity: 'THE INVESTMENT HERO',
    issueNo: '#006',
    hexColor: '#10B981',
    bgColorClass: 'bg-[#10B981]',
    textColorClass: 'text-white',
    borderClass: 'border-[#10B981]',
    tagline: '"GROWTH & FUTURE-FOCUSED SUPERHERO — BUILD WEALTH OVER TIME."',
    icon: TrendingUp,
  },
};

function CalculatorsContent() {
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get('tool') as keyof typeof TOOL_THEMES || 'percentage';

  const [activeTab, setActiveTab] = useState<keyof typeof TOOL_THEMES>(
    TOOL_THEMES[requestedTool] ? requestedTool : 'percentage'
  );

  useEffect(() => {
    const t = searchParams.get('tool') as keyof typeof TOOL_THEMES;
    if (t && TOOL_THEMES[t]) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Current theme
  const currentTheme = TOOL_THEMES[activeTab] || TOOL_THEMES.percentage;

  // Percentage state
  const [pctVal, setPctVal] = useState('18');
  const [pctBase, setPctBase] = useState('25000');

  // GST state
  const [gstAmount, setGstAmount] = useState('28000');
  const [gstRate, setGstRate] = useState('18');
  const [gstMode, setGstMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  // Discount state
  const [discPrice, setDiscPrice] = useState('1500');
  const [discPct, setDiscPct] = useState('20');

  // Age state
  const [birthDate, setBirthDate] = useState('2000-01-15');

  // EMI state
  const [loanAmt, setLoanAmt] = useState('500000');
  const [loanRate, setLoanRate] = useState('8.5');
  const [loanTenure, setLoanTenure] = useState('36');

  // SIP state
  const [sipMonthly, setSipMonthly] = useState('5000');
  const [sipReturnRate, setSipReturnRate] = useState('12');
  const [sipYears, setSipYears] = useState('10');

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculations
  const basePrice = parseFloat(gstAmount) || 0;
  const rate = parseFloat(gstRate) || 0;
  let gstCalculatedAmount = 0;
  let netTotalAmount = 0;
  if (gstMode === 'exclusive') {
    gstCalculatedAmount = (basePrice * rate) / 100;
    netTotalAmount = basePrice + gstCalculatedAmount;
  } else {
    netTotalAmount = basePrice;
    const originalPrice = basePrice / (1 + rate / 100);
    gstCalculatedAmount = basePrice - originalPrice;
  }
  const cgstAmount = gstCalculatedAmount / 2;
  const sgstAmount = gstCalculatedAmount / 2;

  const P = parseFloat(loanAmt) || 0;
  const r = (parseFloat(loanRate) || 0) / 12 / 100;
  const n = parseFloat(loanTenure) || 0;
  const emiVal = (P && r && n) ? Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;
  const totalLoanPayment = emiVal * n;
  const totalLoanInterest = totalLoanPayment - P;

  const P_sip = parseFloat(sipMonthly) || 0;
  const i_sip = (parseFloat(sipReturnRate) || 0) / 12 / 100;
  const n_sip = (parseFloat(sipYears) || 0) * 12;
  const totalInvestedSip = P_sip * n_sip;
  const totalSipWealth = (P_sip && i_sip && n_sip) ? Math.round(P_sip * ((Math.pow(1 + i_sip, n_sip) - 1) / i_sip) * (1 + i_sip)) : 0;
  const totalSipEstReturns = totalSipWealth - totalInvestedSip;

  // Age calculation
  const bDate = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - bDate.getFullYear();
  let months = today.getMonth() - bDate.getMonth();
  let days = today.getDate() - bDate.getDate();
  if (days < 0) {
    months -= 1;
    days += 30;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const ThemeIcon = currentTheme.icon;

  return (
    <div className="space-y-8 py-6 transition-colors duration-300">
      
      {/* Dynamic Comic Issue Header transforming with Tool Color */}
      <div 
        className="comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: currentTheme.hexColor,
          color: currentTheme.textColorClass === 'text-white' ? '#FFFFFF' : '#000000',
        }}
      >
        <div className="flex items-center justify-between">
          <Link 
            href="/tools" 
            className="text-xs font-black hover:underline flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-lg border border-white shadow-[2px_2px_0_#000]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TOOLBOX</span>
          </Link>
          <span className="bg-black text-white font-mono font-black text-xs px-3 py-1 border border-white rounded-lg rotate-[1deg]">
            ISSUE {currentTheme.issueNo}
          </span>
        </div>

        <div className="space-y-1">
          <div className="font-mono text-xs font-black uppercase tracking-widest opacity-90">
            {currentTheme.heroIdentity}
          </div>
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-3">
            <ThemeIcon className="w-9 h-9 stroke-[2.8]" />
            <span>{currentTheme.name}</span>
          </h1>
          <p className="font-bold text-xs sm:text-sm italic opacity-95">
            {currentTheme.tagline}
          </p>
        </div>
      </div>

      {/* Comic Tool Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TOOL_THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key as keyof typeof TOOL_THEMES);
              sound.playPop();
            }}
            className={`btn-comic text-xs px-4 py-2 font-black transition-all ${
              activeTab === key ? 'scale-105 shadow-comic-md border-2 border-black' : 'btn-comic-white'
            }`}
            style={{
              backgroundColor: activeTab === key ? theme.hexColor : undefined,
              color: activeTab === key ? (theme.textColorClass === 'text-white' ? '#FFFFFF' : '#000000') : undefined,
            }}
          >
            ISSUE {theme.issueNo}: {theme.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tool Content Body */}
      <div 
        className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-8 rounded-2xl relative"
        style={{
          borderTopWidth: '8px',
          borderTopColor: currentTheme.hexColor,
        }}
      >
        {/* PERCENTAGE HERO */}
        {activeTab === 'percentage' && (
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="font-black text-2xl uppercase">Percentage Calculator</h2>
              <p className="text-xs font-bold text-gray-600">Calculate percentage of values & percentage increases.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Percentage (%)</label>
                  <input
                    type="number"
                    value={pctVal}
                    onChange={(e) => setPctVal(e.target.value)}
                    className="comic-input w-full text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Base Amount (Y)</label>
                  <input
                    type="number"
                    value={pctBase}
                    onChange={(e) => setPctBase(e.target.value)}
                    className="comic-input w-full text-lg font-bold"
                  />
                </div>
              </div>

              <div className="bg-[#FFD83D] comic-border-md p-6 space-y-3 font-mono font-bold rounded-xl shadow-comic-sm">
                <div className="text-xs font-sans font-black uppercase text-black">RESULT</div>
                <div className="text-4xl font-black text-black">
                  {((parseFloat(pctVal) / 100) * parseFloat(pctBase) || 0).toLocaleString()}
                </div>
                <p className="text-xs text-black/80 font-bold">
                  {pctVal}% of {pctBase} equals {((parseFloat(pctVal) / 100) * parseFloat(pctBase) || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GST TAX HERO */}
        {activeTab === 'gst' && (
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="font-black text-2xl uppercase">GST Calculator (India)</h2>
              <p className="text-xs font-bold text-gray-600">Calculate CGST, SGST, Net Total and tax invoices.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Base Amount (₹)</label>
                  <input
                    type="number"
                    value={gstAmount}
                    onChange={(e) => setGstAmount(e.target.value)}
                    className="comic-input w-full text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1 uppercase">GST Rate (%)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['5', '12', '18', '28'].map((rRate) => (
                      <button
                        key={rRate}
                        type="button"
                        onClick={() => setGstRate(rRate)}
                        className={`btn-comic text-xs py-1.5 font-black ${gstRate === rRate ? 'bg-[#FF3344] text-white' : 'btn-comic-white'}`}
                      >
                        {rRate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black mb-1 uppercase">GST Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGstMode('exclusive')}
                      className={`btn-comic text-xs py-2 font-black ${gstMode === 'exclusive' ? 'bg-[#FF3344] text-white' : 'btn-comic-white'}`}
                    >
                      Exclusive (+GST)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGstMode('inclusive')}
                      className={`btn-comic text-xs py-2 font-black ${gstMode === 'inclusive' ? 'bg-[#FF3344] text-white' : 'btn-comic-white'}`}
                    >
                      Inclusive (-GST)
                    </button>
                  </div>
                </div>
              </div>

              {/* GST Breakdown */}
              <div className="bg-[#FF3344] text-white comic-border-md p-6 space-y-4 font-mono font-bold rounded-xl shadow-comic-sm">
                <div className="flex justify-between items-center pb-2 border-b-2 border-white">
                  <span className="font-sans font-black text-base uppercase">TAX INVOICE BREAKDOWN</span>
                  <button
                    onClick={() => copyToClipboard(`GST Breakdown: Net: ₹${netTotalAmount.toFixed(2)}, GST: ₹${gstCalculatedAmount.toFixed(2)}`)}
                    className="btn-comic bg-white text-black p-1.5 text-xs font-black"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Base Amount:</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black">
                  <span>GST Rate:</span>
                  <span>{gstRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CGST (Central):</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST (State):</span>
                  <span>₹{sgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 border-t-2 border-white">
                  <span>NET TOTAL:</span>
                  <span>₹{netTotalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOAN GUARDIAN */}
        {activeTab === 'loan' && (
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="font-black text-2xl uppercase">Loan Calculator</h2>
              <p className="text-xs font-bold text-gray-600">Monthly EMI breakdown for principal & interest payments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={loanAmt}
                    onChange={(e) => setLoanAmt(e.target.value)}
                    className="comic-input w-full font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className="comic-input w-full font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Tenure (Months)</label>
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    className="comic-input w-full font-bold"
                  />
                </div>
              </div>

              <div className="bg-[#2563EB] text-white comic-border-md p-6 space-y-4 font-mono font-bold rounded-xl shadow-comic-sm">
                <div className="text-xs font-sans font-black uppercase">MONTHLY EMI</div>
                <div className="text-4xl font-black">
                  ₹{emiVal.toLocaleString()}
                </div>
                <div className="pt-3 border-t-2 border-white space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Principal Amount:</span>
                    <span>₹{P.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Interest:</span>
                    <span>₹{totalLoanInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black pt-1 border-t border-white text-sm">
                    <span>Total Payable:</span>
                    <span>₹{totalLoanPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SAVINGS HERO */}
        {activeTab === 'discount' && (
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="font-black text-2xl uppercase">Discount & Savings Calculator</h2>
              <p className="text-xs font-bold text-gray-600">Calculate final price after store discounts & net savings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Original Price (₹)</label>
                  <input
                    type="number"
                    value={discPrice}
                    onChange={(e) => setDiscPrice(e.target.value)}
                    className="comic-input w-full text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Discount (% Off)</label>
                  <input
                    type="number"
                    value={discPct}
                    onChange={(e) => setDiscPct(e.target.value)}
                    className="comic-input w-full text-lg font-bold"
                  />
                </div>
              </div>

              <div className="bg-[#FF6B00] text-white comic-border-md p-6 space-y-4 font-mono font-bold rounded-xl shadow-comic-sm">
                <div className="text-xs font-sans font-black uppercase">FINAL DEAL PRICE</div>
                <div className="text-4xl font-black">
                  ₹{(parseFloat(discPrice) * (1 - parseFloat(discPct)/100) || 0).toFixed(2)}
                </div>
                <div className="pt-3 border-t-2 border-white text-sm flex justify-between font-black">
                  <span>YOU SAVE:</span>
                  <span>₹{(parseFloat(discPrice) * (parseFloat(discPct)/100) || 0).toFixed(2)} ({discPct}% OFF)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMEKEEPER */}
        {activeTab === 'age' && (
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="font-black text-2xl uppercase">Age & Date Calculator</h2>
              <p className="text-xs font-bold text-gray-600">Exact age in years, months, days, and total days lived.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black mb-1 uppercase">Date of Birth</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="comic-input w-full text-lg font-bold"
                />
              </div>

              <div className="bg-[#8B5CF6] text-white comic-border-md p-6 space-y-4 font-mono font-bold rounded-xl shadow-comic-sm">
                <div className="text-xs font-sans font-black uppercase">YOUR EXACT AGE</div>
                <div className="text-3xl font-black">
                  {years} Years, {months} Months, {days} Days
                </div>
                <p className="text-xs text-white/90">
                  Calculated dynamically relative to today ({today.toLocaleDateString()}).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SIP INVESTMENT HERO */}
        {activeTab === 'sip' && (
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="font-black text-2xl uppercase">SIP Calculator</h2>
              <p className="text-xs font-bold text-gray-600">Project mutual fund SIP growth and expected returns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Monthly Investment (₹)</label>
                  <input
                    type="number"
                    value={sipMonthly}
                    onChange={(e) => setSipMonthly(e.target.value)}
                    className="comic-input w-full font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Expected Return Rate (% p.a.)</label>
                  <input
                    type="number"
                    value={sipReturnRate}
                    onChange={(e) => setSipReturnRate(e.target.value)}
                    className="comic-input w-full font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 uppercase">Time Period (Years)</label>
                  <input
                    type="number"
                    value={sipYears}
                    onChange={(e) => setSipYears(e.target.value)}
                    className="comic-input w-full font-bold"
                  />
                </div>
              </div>

              <div className="bg-[#10B981] text-white comic-border-md p-6 space-y-4 font-mono font-bold rounded-xl shadow-comic-sm">
                <div className="text-xs font-sans font-black uppercase">ESTIMATED WEALTH</div>
                <div className="text-4xl font-black">
                  ₹{totalSipWealth.toLocaleString()}
                </div>
                <div className="pt-3 border-t-2 border-white space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Total Invested:</span>
                    <span>₹{totalInvestedSip.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm">
                    <span>Estimated Returns:</span>
                    <span>₹{totalSipEstReturns.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default function CalculatorsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black">⚡ LOADING CALCULATORS...</div>}>
      <CalculatorsContent />
    </Suspense>
  );
}
