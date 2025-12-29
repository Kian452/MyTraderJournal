import Link from 'next/link'

/**
 * Landing page with marketing content
 * Explains the value of trading journals and features
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Track Your Trading
            <span className="block text-purple-600 dark:text-purple-400">Journey</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Build discipline, recognize patterns, and improve your trading results with a comprehensive journal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Journaling
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg text-lg font-medium transition-all duration-300 hover:scale-105 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Why Journal Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Keep a Trading Journal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Build Discipline</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track every trade to maintain consistency and stick to your trading plan. Accountability leads to better decisions.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pattern Recognition</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Identify what works and what doesn&apos;t. Spot recurring patterns in your winning and losing trades.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Improve Results</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Make data-driven decisions. Understand your risk-reward ratios and optimize your trading strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Multiple Journals', desc: 'Track different strategies or accounts separately' },
              { title: 'Trade Tracking', desc: 'Record every trade with risk amount, outcome, and RR' },
              { title: 'Partial Exits', desc: 'Track complex trades with multiple exit points' },
              { title: 'Equity Curve', desc: 'Visualize your account growth over time' },
              { title: 'Calendar P/L', desc: 'See daily profit and loss at a glance' },
              { title: 'Win Rate & Metrics', desc: 'Track win rate, average RR, and key performance indicators' },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            {[
              { step: '1', title: 'Create a Journal', desc: 'Set up a journal for each trading strategy or account' },
              { step: '2', title: 'Record Trades', desc: 'Add each trade with risk amount, outcome, and risk-reward ratio' },
              { step: '3', title: 'Analyze Performance', desc: 'Review your equity curve, win rate, and key metrics' },
              { step: '4', title: 'Improve Strategy', desc: 'Use insights to refine your approach and increase profitability' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Do I need multiple journals?',
                a: 'Not necessarily. You can use one journal for all trades, or create separate journals for different strategies, timeframes, or accounts.',
              },
              {
                q: 'What is a risk-reward ratio (RR)?',
                a: 'RR measures how much you stand to gain compared to how much you risk. For example, a 2:1 RR means you aim to make $2 for every $1 you risk.',
              },
              {
                q: 'Can I track partial exits?',
                a: 'Yes! You can record trades with multiple exit points, each with its own position percentage and RR.',
              },
              {
                q: 'How does this improve my trading?',
                a: 'By tracking every trade, you can identify patterns, understand what works, and make data-driven decisions to improve your results over time.',
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. Your trading data is stored securely and only accessible to you. We use industry-standard security practices.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-800 dark:to-purple-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join traders who are improving their results with disciplined journaling
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">MyTraderJournal</h3>
              <p className="text-sm">
                Track and analyze your trading performance with comprehensive journaling tools.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/login" className="hover:text-purple-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-purple-400 transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">About</h3>
              <p className="text-sm">
                Built for traders who want to improve their results through disciplined tracking and analysis.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} MyTraderJournal. All rights reserved.</p>
            <p className="mt-2 text-gray-500 dark:text-gray-500">
              Created by Kian and Elias
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
