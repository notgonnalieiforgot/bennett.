import type { ModuleContent } from '../types/Knowledge';
import { QUIZ_PASS_THRESHOLD } from '../types/Knowledge';

/**
 * Phase 3 module content. 20-min foundation per module — text-only lesson
 * cards plus a 5-question quiz. Phase 4+ will move this to Firestore so
 * the Founder can edit without a code release.
 *
 * Voice rule: lowercase, iMessage-leaning. Per Critical Rules #4 and the
 * persona spec, only the Bennett-spoken Friend lines stay strict; module
 * body copy can use sentence case for instructional clarity.
 */

export const MODULES: ModuleContent[] = [
  {
    id: 'fitness',
    name: 'Fitness',
    emoji: '🏋️',
    oneLiner: 'biology-first protocols. sleep, vo2 max, nutrition timing.',
    lessons: [
      {
        id: 'fit-sleep',
        title: 'Sleep Is the Multiplier',
        durationMin: 6,
        body: 'Sleep determines how every other input lands.\n\n— Aim for a fixed wake time, even on weekends.\n— Get sunlight in the eyes within 30 minutes of waking.\n— Last meal ≥3 hours before bed.\n— Cap caffeine ~10 hours before sleep.\n\nRule: protect wake time first; bedtime follows.',
      },
      {
        id: 'fit-vo2',
        title: 'VO2 Max — Your Survival Curve',
        durationMin: 7,
        body: 'VO2 max is the strongest predictor of all-cause mortality.\n\nProtocol (Norwegian 4×4):\n1. Warm up 10 min easy.\n2. 4 minutes hard (90% effort).\n3. 3 minutes easy.\n4. Repeat ×4. Cool down 5 min.\n\nDose: 1–2 sessions per week. Anything you can hold a conversation through is too easy.',
      },
      {
        id: 'fit-nutrition',
        title: 'Protein Timing',
        durationMin: 4,
        body: 'Most people are protein-deficient and don\'t know it.\n\n— Target: 0.8–1g of protein per pound of target body weight.\n— Spread across 3–4 meals (~30–50g each).\n— Whole-food sources first; supplement only if you can\'t hit target.\n\nIf one meal goes off-protocol, the next one absorbs the cost. Don\'t double-fail.',
      },
      {
        id: 'fit-recovery',
        title: 'Strength + Recovery',
        durationMin: 5,
        body: 'Strength training 2–3× per week beats cardio for body composition.\n\n— Compound lifts: squat, deadlift, press, row.\n— Track: same lift gets +1 rep or +5 lbs week over week.\n— Recovery is the program: protein, sleep, walking.\n\nIf you can\'t recover, you\'re not training. You\'re damaging.',
      },
    ],
    quiz: {
      passThreshold: QUIZ_PASS_THRESHOLD,
      questions: [
        {
          prompt: 'What is the strongest predictor of all-cause mortality from this module?',
          options: ['BMI', 'VO2 max', 'Resting heart rate', 'Body fat %'],
          answerIndex: 1,
        },
        {
          prompt: 'A "Norwegian 4×4" interval is:',
          options: [
            '4 minutes at 90% × 4 reps with 3 min easy between',
            '4 reps × 4 min easy',
            '4-second sprints × 4 sets',
            '4 km × 4 days a week',
          ],
          answerIndex: 0,
        },
        {
          prompt: 'Recommended daily protein target in this module:',
          options: [
            '0.3 g per pound of body weight',
            '0.8–1 g per pound of target body weight',
            '2 g per pound of body weight',
            'Whatever fits your calorie target',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'Per the sleep protocol, what should you protect FIRST?',
          options: ['Bedtime', 'Wake time', 'Total hours', 'Sleep latency'],
          answerIndex: 1,
        },
        {
          prompt: 'The module frames recovery as:',
          options: [
            'Optional once you\'re fit',
            'A reward for hard training',
            'The program itself — without it you\'re damaging, not training',
            'The same as rest days',
          ],
          answerIndex: 2,
        },
      ],
    },
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    emoji: '🏠',
    oneLiner: 'ethical leverage. cap rates. how to read a market.',
    lessons: [
      {
        id: 're-cap',
        title: 'Cap Rate Basics',
        durationMin: 6,
        body: 'Cap rate = Net Operating Income ÷ Property Price.\n\nNOI = annual rent − operating expenses (taxes, insurance, repairs, vacancy). Excludes mortgage, depreciation, capex.\n\nA 7% cap means $70k NOI on a $1M property. Higher cap = better return per dollar (but typically more risk or worse market).\n\nDon\'t confuse cap rate with cash-on-cash return. Cap is unlevered. Cash-on-cash is what you actually feel.',
      },
      {
        id: 're-leverage',
        title: 'Ethical Leverage',
        durationMin: 6,
        body: 'Leverage amplifies outcomes. It does not change which direction the market is moving.\n\nRules:\n— Always stress-test rents at -20%.\n— Always stress-test vacancy at +50%.\n— Reserve 6 months of mortgage in cash before close.\n\nIf the deal only works on best-case assumptions, it isn\'t a deal — it\'s a bet.',
      },
      {
        id: 're-market',
        title: 'Reading a Market',
        durationMin: 4,
        body: 'Three numbers to know for any market before you buy:\n\n1. Median rent ÷ median price (the rent multiplier)\n2. Population growth, 5-year trailing\n3. Job mix — concentrated in one industry is fragile\n\nIf median rent ÷ median price is below 0.5%, the market is for appreciation, not income.',
      },
      {
        id: 're-deal',
        title: 'Deal Analysis Workflow',
        durationMin: 4,
        body: 'For every deal:\n1. Pull comps within 1 mile, last 6 months.\n2. Verify expenses against actual seller P&Ls.\n3. Underwrite at conservative rents.\n4. Walk the property in person before LOI.\n\nNever skip the walk. The pictures lie.',
      },
    ],
    quiz: {
      passThreshold: QUIZ_PASS_THRESHOLD,
      questions: [
        {
          prompt: 'Cap rate is calculated as:',
          options: [
            'Annual rent ÷ price',
            'Net Operating Income ÷ price',
            'Cash flow after mortgage ÷ price',
            'Sale price ÷ purchase price',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'NOI excludes which of these?',
          options: ['Property taxes', 'Insurance', 'Mortgage payment', 'Vacancy allowance'],
          answerIndex: 2,
        },
        {
          prompt: 'The module says to stress-test rents at:',
          options: ['-5%', '-10%', '-20%', '-50%'],
          answerIndex: 2,
        },
        {
          prompt: 'A rent-to-price ratio below 0.5% indicates a market is best for:',
          options: ['Cash flow', 'Appreciation', 'Short-term rentals', 'House hacking'],
          answerIndex: 1,
        },
        {
          prompt: 'Per the deal-analysis workflow, you should NEVER skip:',
          options: ['The Zestimate check', 'Walking the property in person', 'Pulling crime stats', 'Calling the listing agent'],
          answerIndex: 1,
        },
      ],
    },
  },
  {
    id: 'investing',
    name: 'Investing',
    emoji: '📈',
    oneLiner: 'knowledge multipliers. index fundamentals. real risk framing.',
    lessons: [
      {
        id: 'inv-index',
        title: 'Why Index Funds Win',
        durationMin: 5,
        body: 'Most active managers underperform their benchmark over 10+ years.\n\nThe math: average market return − fees − tax drag − behavior gap.\n\nIndex funds remove three of those four leaks. Behavior is the one that\'s on you.\n\nFor most people: a 3-fund portfolio (US, international, bonds) at low cost is better than 99% of active strategies. Boring is the strategy.',
      },
      {
        id: 'inv-risk',
        title: 'Risk vs Volatility',
        durationMin: 4,
        body: 'Volatility is not risk. Volatility is the price of admission.\n\nReal risk = permanent loss of capital + not having the cash you need when you need it.\n\nSet up:\n— 3–6 months of expenses in cash.\n— Long-term money in equities, untouched.\n— Don\'t check daily. Daily noise breaks long-term plans.',
      },
      {
        id: 'inv-tax',
        title: 'Tax-Advantaged Accounts',
        durationMin: 5,
        body: 'Order of priority for most people:\n1. 401(k) up to employer match (free money).\n2. Max HSA if eligible (triple tax advantage).\n3. Max Roth IRA.\n4. Back to 401(k) up to limit.\n5. Taxable brokerage.\n\nMissing the match is leaving real, compounding money on the table. Set it up once.',
      },
      {
        id: 'inv-greeks',
        title: 'When Options Make Sense (and When They Don\'t)',
        durationMin: 6,
        body: 'Options are tools. For most people, they\'re tools that destroy capital.\n\nLegitimate uses:\n— Covered calls on shares you already own.\n— Cash-secured puts on shares you want to own at a lower price.\n— Long-dated calls (LEAPS) for high conviction with smaller capital.\n\nIf you can\'t explain delta, gamma, theta, and vega in one sentence each, don\'t trade options. The Greeks are the price tag.',
      },
    ],
    quiz: {
      passThreshold: QUIZ_PASS_THRESHOLD,
      questions: [
        {
          prompt: 'The module defines real risk as:',
          options: [
            'Daily price volatility',
            'Standard deviation of returns',
            'Permanent loss of capital + not having cash when you need it',
            'Beta vs the S&P 500',
          ],
          answerIndex: 2,
        },
        {
          prompt: 'Suggested first priority for investing dollars:',
          options: ['Roth IRA', 'HSA', '401(k) up to employer match', 'Taxable brokerage'],
          answerIndex: 2,
        },
        {
          prompt: 'A 3-fund portfolio typically includes:',
          options: [
            'US stocks, gold, crypto',
            'US stocks, international stocks, bonds',
            'Tech, energy, healthcare',
            'Large cap, small cap, REITs',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'Cash-secured puts are appropriate when:',
          options: [
            'You want to short the stock',
            'You want to own the underlying at a lower price',
            'You want maximum leverage',
            'You want to avoid taxes',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'Recommended emergency fund per this module:',
          options: ['1 month of expenses', '3–6 months of expenses', '12 months of expenses', 'Whatever fits in your HSA'],
          answerIndex: 1,
        },
      ],
    },
  },
  {
    id: 'ai_tech',
    name: 'AI & Tech',
    emoji: '🤖',
    oneLiner: 'capitalization strategies. model capabilities. tool workflows.',
    lessons: [
      {
        id: 'ai-leverage',
        title: 'AI as Personal Leverage',
        durationMin: 5,
        body: 'AI doesn\'t replace skilled work. It compresses the time skilled work takes.\n\nFor any task, ask:\n— Can a frontier model do a credible first draft?\n— Can it stress-test my reasoning?\n— Can it pattern-match against examples I haven\'t seen?\n\nIf yes to any, you\'re losing time by not using it. Treat it like an intern that never sleeps.',
      },
      {
        id: 'ai-prompting',
        title: 'Prompting That Compounds',
        durationMin: 5,
        body: 'Three patterns that beat 90% of prompts:\n\n1. Specify the role + the audience + the constraint.\n2. Give 1–3 examples of the output format you want.\n3. Ask the model to plan first, then execute.\n\nSave prompts that work. Treat your prompt library like a code library.',
      },
      {
        id: 'ai-tools',
        title: 'Tool Stack for Compounding Output',
        durationMin: 5,
        body: 'Categories worth investing 30 minutes to set up:\n— A coding assistant inside your editor.\n— A model wired into your inbox / docs (read-only first).\n— A voice-to-text capture for ideas on the move.\n— A scheduling assistant with calendar write access.\n\nEach saves 5–15 minutes a day. That compounds to weeks per year.',
      },
      {
        id: 'ai-limits',
        title: 'Where Models Still Lie',
        durationMin: 5,
        body: 'Do not trust models for:\n— Specific numbers (citations, prices, dates) without verification.\n— Legal/medical advice.\n— Anything where being wrong is unrecoverable.\n\nAlways verify the parts the model can\'t feel the cost of getting wrong.',
      },
    ],
    quiz: {
      passThreshold: QUIZ_PASS_THRESHOLD,
      questions: [
        {
          prompt: 'According to this module, AI primarily:',
          options: [
            'Replaces skilled work',
            'Compresses the time skilled work takes',
            'Generates novel research',
            'Eliminates the need for verification',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'A prompting pattern that compounds:',
          options: [
            'Always ask multiple-choice questions',
            'Specify role + audience + constraint and ask model to plan before executing',
            'Use as few words as possible',
            'Avoid examples — they bias the model',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'Which is a category to invest 30 minutes setting up?',
          options: [
            'A meme generator',
            'A coding assistant inside your editor',
            'A second monitor',
            'A custom GPU rig',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'When should you NOT trust a model?',
          options: [
            'Brainstorming',
            'Drafting an email',
            'Specific citations, prices, dates without verification',
            'Summarizing a public article',
          ],
          answerIndex: 2,
        },
        {
          prompt: 'The module describes a frontier model as:',
          options: [
            'A replacement for senior engineers',
            'A search engine',
            'An intern that never sleeps',
            'A junior associate that bills hours',
          ],
          answerIndex: 2,
        },
      ],
    },
  },
  {
    id: 'cooking',
    name: 'Cooking',
    emoji: '🍳',
    oneLiner: 'high-protein meal protocols. macro optimization. real fuel.',
    lessons: [
      {
        id: 'cook-template',
        title: 'The 30-30-30 Plate',
        durationMin: 4,
        body: 'A working template for 90% of meals:\n— 30g of protein.\n— 30g of slow carbs (rice, oats, potatoes, beans).\n— 30g of vegetables (anything green or colorful).\n\nIf you can build this from your fridge in 10 minutes, you\'ve solved cooking.\n\nDon\'t overthink seasoning. Salt + acid + fat covers most cuisines. Lemon, soy, olive oil, salt — endless variations.',
      },
      {
        id: 'cook-prep',
        title: 'Sunday Setup',
        durationMin: 5,
        body: 'Two hours on Sunday saves 5 hours during the week.\n\n— Roast 2 sheet pans of vegetables.\n— Cook a pot of grains (rice or farro).\n— Bake or pan-sear 1.5 lb of protein.\n— Wash + prep one container of greens.\n\nMix and match. By Wednesday you stop thinking about food.',
      },
      {
        id: 'cook-costs',
        title: 'Cost vs Time vs Health',
        durationMin: 4,
        body: 'You\'re always trading among three: cost, time, and health.\n\n— Cooking at home: cheapest + healthiest + slowest.\n— Pre-cooked grocery: middle on all three.\n— Restaurant: fastest, most expensive, hardest to control nutrition.\n\nPick a default for weekday lunches. Don\'t re-decide daily.',
      },
      {
        id: 'cook-flavors',
        title: 'Flavor Without Recipes',
        durationMin: 4,
        body: 'Three universal flavor moves:\n\n1. Brown the protein hard — Maillard is non-negotiable.\n2. Finish with acid — squeeze of lemon, splash of vinegar.\n3. Finish with fat — drizzle of olive oil, knob of butter.\n\nAlmost any home dish improves on these three. Recipes are training wheels.',
      },
    ],
    quiz: {
      passThreshold: QUIZ_PASS_THRESHOLD,
      questions: [
        {
          prompt: 'The 30-30-30 plate template is:',
          options: [
            '30g protein, 30g carbs, 30g vegetables',
            '30g of each macro',
            '30 minutes prep, 30 minutes cook, 30 minutes eat',
            '30% protein, 30% carbs, 30% fat',
          ],
          answerIndex: 0,
        },
        {
          prompt: 'Three universal flavor moves:',
          options: [
            'Salt early, salt often, salt at the end',
            'Brown the protein, finish with acid, finish with fat',
            'Use fresh herbs only',
            'Add sugar, salt, and MSG',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'Sunday setup is:',
          options: [
            'Cooking every meal in advance',
            'Two hours of prep that saves 5 hours during the week',
            'Going out to brunch',
            'Reading recipes',
          ],
          answerIndex: 1,
        },
        {
          prompt: 'Per this module, cheapest + healthiest + slowest is:',
          options: ['Restaurant', 'Pre-cooked grocery', 'Cooking at home', 'Meal-kit subscription'],
          answerIndex: 2,
        },
        {
          prompt: 'Recipes are described as:',
          options: ['The only path to good food', 'Training wheels', 'Always essential', 'Best when followed exactly'],
          answerIndex: 1,
        },
      ],
    },
  },
];

export const MODULE_BY_ID: Record<string, ModuleContent> =
  Object.fromEntries(MODULES.map((m) => [m.id, m]));
