'use client';

import React, { useState } from 'react';
import { Wallet, Plus, TrendingUp, PieChart, Shield } from 'lucide-react';
import { storage, ExpenseItem } from '@/lib/storage';
import { sound } from '@/lib/sound';

export default function MoneyPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(storage.getExpenses());
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount.trim()) return;

    const updated = storage.addExpense({
      title,
      amount: parseFloat(amount) || 0,
      category,
      date: new Date().toISOString().split('T')[0]
    });

    setExpenses(updated);
    setTitle('');
    setAmount('');
    sound.playPop();
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsTarget = 50000;
  const currentSavings = 17500;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex items-center gap-2">
          <span className="comic-sticker comic-sticker-yellow">
            FINANCE VAULT
          </span>
          <span className="text-xs font-mono font-bold bg-[#B9A7FF] comic-border-sm px-2 py-0.5">
            LOCAL STORAGE ONLY
          </span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight">
          THE VAULT
        </h1>

        <p className="font-extrabold text-gray-700 text-sm sm:text-base">
          Track quick expenses, manage category budgets, and monitor your savings goals.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="comic-card-yellow p-5 font-mono font-bold">
          <div className="text-xs font-sans font-black uppercase text-gray-800">TOTAL SPENT</div>
          <div className="text-3xl font-black text-black">₹{totalSpent.toLocaleString()}</div>
        </div>

        <div className="comic-card-purple p-5 font-mono font-bold">
          <div className="text-xs font-sans font-black uppercase text-gray-800">SAVINGS GOAL</div>
          <div className="text-3xl font-black text-black">₹{currentSavings.toLocaleString()} / ₹{savingsTarget.toLocaleString()}</div>
          <div className="w-full bg-white comic-border-sm h-3 mt-2 overflow-hidden">
            <div className="bg-[#FF5A5F] h-full" style={{ width: `${(currentSavings/savingsTarget)*100}%` }} />
          </div>
        </div>

        <div className="comic-card-cream p-5 font-mono font-bold flex flex-col justify-between">
          <div className="text-xs font-sans font-black uppercase text-gray-800">PRIVACY PROTECTION</div>
          <div className="text-xs font-sans font-extrabold text-gray-700 flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-700" />
            <span>100% Client-Side Local Vault</span>
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="comic-card p-6 space-y-4">
        <h2 className="font-black text-lg border-b-2 border-black pb-2 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#FFD83D]" />
          <span>LOG QUICK EXPENSE</span>
        </h2>

        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Item / Description (e.g. Lunch)"
            className="comic-input text-xs"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="comic-input text-xs"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="comic-input text-xs font-bold"
          >
            {['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="btn-comic btn-comic-yellow text-xs py-2">
            ADD EXPENSE
          </button>
        </form>
      </div>

      {/* Expenses History List */}
      <div className="bg-white comic-border-lg shadow-comic p-6 space-y-4">
        <h3 className="font-black text-xl uppercase">RECENT EXPENSES HISTORY</h3>

        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="p-3 bg-[#FFFDF5] comic-border-sm flex items-center justify-between text-xs font-bold font-mono">
              <div className="flex items-center gap-2">
                <span className="bg-[#B9A7FF] text-black px-2 py-0.5 text-[10px]">{e.category}</span>
                <span className="font-sans font-black">{e.title}</span>
              </div>
              <div className="text-sm font-black text-[#FF5A5F]">
                -₹{e.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
