import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  SplitSquareHorizontal,
  HandCoins,
  BarChart3,
  Users,
  Receipt,
  Check,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">How it works</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Features</a>
            <a href="#footer" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">About</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/80 to-white dark:from-primary-500/10 dark:to-slate-950" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Wallet className="h-4 w-4" />
              Smart group expense management
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Split expenses.{' '}
              <span className="bg-gradient-to-r from-primary-600 to-teal-500 bg-clip-text text-transparent">
                Settle smarter.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Manage group expenses, track balances, and simplify settlements in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup" className="btn-primary w-full sm:w-auto">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary w-full sm:w-auto">Login</Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="card overflow-hidden p-0 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
                <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                      <Receipt className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">$1,240</p>
                      <p className="text-xs text-slate-500">Total expenses</p>
                    </div>
                  </div>
                </div>
                <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">4 groups</p>
                      <p className="text-xs text-slate-500">Active groups</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                      <HandCoins className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">$85.50</p>
                      <p className="text-xs text-slate-500">You are owed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
            <p className="mt-4 text-slate-600">Three simple steps to manage your shared expenses.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Users, step: '01', title: 'Create a group', desc: 'Start a group for your trip, apartment, or any shared expense scenario. Invite friends in seconds.' },
              { icon: SplitSquareHorizontal, step: '02', title: 'Add expenses', desc: 'Log expenses and split them fairly. Equal splits, custom amounts, or percentages — your choice.' },
              { icon: HandCoins, step: '03', title: 'Settle up', desc: 'See who owes what at a glance. Settle balances with minimal transactions and keep everyone happy.' },
            ].map((item) => (
              <div key={item.step} className="card p-8 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <item.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-100">{item.step}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expense splitting */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                <SplitSquareHorizontal className="h-4 w-4" />
                Expense splitting
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Split any way you want
              </h2>
              <p className="mt-4 text-slate-600">
                Equal splits, custom amounts, or by percentage. Smart Expense Manager handles every splitting scenario so nobody overpays.
              </p>
              <ul className="mt-6 space-y-3">
                {['Equal splits with one tap', 'Custom amounts per person', 'Percentage-based splits', 'Exclude people from specific expenses'].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100">
                      <Check className="h-3 w-3 text-primary-600" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">JD</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">John Doe</p>
                      <p className="text-xs text-slate-500">Paid $120.00</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">Paid</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">JS</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Jane Smith</p>
                      <p className="text-xs text-slate-500">Owes $30.00</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Owes</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">MB</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Mike Brown</p>
                      <p className="text-xs text-slate-500">Owes $30.00</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Owes</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">AL</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Alice Lee</p>
                      <p className="text-xs text-slate-500">Owes $30.00</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Owes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart settlements */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Suggested settlements</h3>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">3 transactions</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">JS</div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">JD</div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">$30.00</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">MB</div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">JD</div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">$30.00</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700">AL</div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">JD</div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">$30.00</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                <HandCoins className="h-4 w-4" />
                Smart settlements
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Minimize transactions, maximize clarity
              </h2>
              <p className="mt-4 text-slate-600">
                Our smart settlement engine calculates the fewest transactions needed to settle all balances. No more confusion about who owes whom.
              </p>
              <ul className="mt-6 space-y-3">
                {['Optimized settlement suggestions', 'Clear balance tracking per group', 'Mark settlements as completed', 'Full settlement history'].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100">
                      <Check className="h-3 w-3 text-primary-600" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Understand your spending
              </h2>
              <p className="mt-4 text-slate-600">
                Visualize where your money goes with detailed analytics. Track spending by category, group, and time period.
              </p>
              <ul className="mt-6 space-y-3">
                {['Spending by category', 'Monthly trends', 'Group-wise breakdowns', 'Export reports'].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100">
                      <Check className="h-3 w-3 text-primary-600" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Monthly spending</h3>
                <span className="text-xs text-slate-500">Last 6 months</span>
              </div>
              <div className="flex items-end justify-between gap-3 h-48">
                {[
                  { month: 'Apr', height: '40%' },
                  { month: 'May', height: '65%' },
                  { month: 'Jun', height: '50%' },
                  { month: 'Jul', height: '80%' },
                  { month: 'Aug', height: '70%' },
                  { month: 'Sep', height: '90%' },
                ].map((bar) => (
                  <div key={bar.month} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-end justify-center" style={{ height: '100%' }}>
                      <div
                        className="w-full max-w-[2.5rem] rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all hover:from-primary-700 hover:to-primary-500"
                        style={{ height: bar.height }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything you need</h2>
            <p className="mt-4 text-slate-600">All the tools to manage shared expenses, in one place.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Group management', desc: 'Create unlimited groups for trips, apartments, and events.' },
              { icon: SplitSquareHorizontal, title: 'Flexible splitting', desc: 'Split equally, by custom amounts, or by percentage.' },
              { icon: HandCoins, title: 'Smart settlements', desc: 'Optimized transaction suggestions to settle up fast.' },
              { icon: BarChart3, title: 'Analytics', desc: 'Track spending patterns with visual reports.' },
              { icon: Receipt, title: 'Expense tracking', desc: 'Log and categorize every shared expense.' },
              { icon: Wallet, title: 'Balance overview', desc: 'Always know who owes what across all groups.' },
            ].map((feature) => (
              <div key={feature.title} className="card p-6 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">Ready to split smarter?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-50">
            Join thousands of groups already managing their expenses the easy way.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition-all hover:bg-primary-50 active:scale-[0.98]">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-400 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-500 active:scale-[0.98]">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 max-w-xs text-sm text-slate-500">
                Smart Expense Manager — the easiest way to split expenses and settle up with friends, roommates, and travel groups.
              </p>
              <div className="mt-6 flex gap-3">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-primary-300 hover:text-primary-600">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Product</h4>
              <ul className="mt-4 space-y-2">
                {['Features', 'How it works', 'Analytics', 'Settlements'].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-slate-900">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Company</h4>
              <ul className="mt-4 space-y-2">
                {['About', 'Blog', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-slate-900">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">&copy; 2026 Smart Expense Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
