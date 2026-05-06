import Foundation

/// Phase 3 module content — Swift mirror of `shared/data/modules.ts`.
/// Kept in lockstep manually; if either side changes, update both.
/// Phase 4+ will move this to Firestore so the Founder can edit live.
enum KnowledgeModuleCatalog {
    static let all: [ModuleContent] = [
        fitness, realEstate, investing, aiTech, cooking,
    ]

    static func byId(_ id: KnowledgeModule) -> ModuleContent? {
        all.first { $0.id == id }
    }

    private static let pass = 0.8

    private static let fitness = ModuleContent(
        id: .fitness,
        name: "Fitness",
        emoji: "🏋️",
        oneLiner: "biology-first protocols. sleep, vo2 max, nutrition timing.",
        lessons: [
            LessonCard(id: "fit-sleep", title: "Sleep Is the Multiplier", body:
"""
Sleep determines how every other input lands.

— Aim for a fixed wake time, even on weekends.
— Get sunlight in the eyes within 30 minutes of waking.
— Last meal ≥3 hours before bed.
— Cap caffeine ~10 hours before sleep.

Rule: protect wake time first; bedtime follows.
""", durationMin: 6),
            LessonCard(id: "fit-vo2", title: "VO2 Max — Your Survival Curve", body:
"""
VO2 max is the strongest predictor of all-cause mortality.

Protocol (Norwegian 4×4):
1. Warm up 10 min easy.
2. 4 minutes hard (90% effort).
3. 3 minutes easy.
4. Repeat ×4. Cool down 5 min.

Dose: 1–2 sessions per week.
""", durationMin: 7),
            LessonCard(id: "fit-nutrition", title: "Protein Timing", body:
"""
Most people are protein-deficient and don't know it.

— Target: 0.8–1g of protein per pound of target body weight.
— Spread across 3–4 meals (~30–50g each).
— Whole-food first; supplement only if you can't hit target.
""", durationMin: 4),
            LessonCard(id: "fit-recovery", title: "Strength + Recovery", body:
"""
Strength training 2–3× per week beats cardio for body composition.

— Compound lifts: squat, deadlift, press, row.
— Track: same lift gets +1 rep or +5 lbs week over week.
— Recovery is the program: protein, sleep, walking.
""", durationMin: 5),
        ],
        quiz: ModuleQuiz(questions: [
            QuizQuestion(
                prompt: "What is the strongest predictor of all-cause mortality from this module?",
                options: ["BMI", "VO2 max", "Resting heart rate", "Body fat %"],
                answerIndex: 1),
            QuizQuestion(
                prompt: "A \"Norwegian 4×4\" interval is:",
                options: [
                    "4 minutes at 90% × 4 reps with 3 min easy between",
                    "4 reps × 4 min easy",
                    "4-second sprints × 4 sets",
                    "4 km × 4 days a week"],
                answerIndex: 0),
            QuizQuestion(
                prompt: "Recommended daily protein target in this module:",
                options: [
                    "0.3 g per pound of body weight",
                    "0.8–1 g per pound of target body weight",
                    "2 g per pound of body weight",
                    "Whatever fits your calorie target"],
                answerIndex: 1),
            QuizQuestion(
                prompt: "Per the sleep protocol, what should you protect FIRST?",
                options: ["Bedtime", "Wake time", "Total hours", "Sleep latency"],
                answerIndex: 1),
            QuizQuestion(
                prompt: "The module frames recovery as:",
                options: [
                    "Optional once you're fit",
                    "A reward for hard training",
                    "The program itself — without it you're damaging, not training",
                    "The same as rest days"],
                answerIndex: 2),
        ], passThreshold: pass)
    )

    private static let realEstate = ModuleContent(
        id: .realEstate,
        name: "Real Estate",
        emoji: "🏠",
        oneLiner: "ethical leverage. cap rates. how to read a market.",
        lessons: [
            LessonCard(id: "re-cap", title: "Cap Rate Basics", body:
"""
Cap rate = NOI ÷ Property Price.

NOI = annual rent − operating expenses (taxes, insurance, repairs, vacancy). Excludes mortgage, depreciation, capex.

A 7% cap means $70k NOI on a $1M property.
""", durationMin: 6),
            LessonCard(id: "re-leverage", title: "Ethical Leverage", body:
"""
Leverage amplifies. It doesn't change direction.

Rules:
— Stress-test rents at -20%.
— Stress-test vacancy at +50%.
— Reserve 6 months of mortgage in cash before close.
""", durationMin: 6),
            LessonCard(id: "re-market", title: "Reading a Market", body:
"""
Three numbers to know before you buy:
1. Median rent ÷ median price.
2. Population growth, 5-year trailing.
3. Job mix — concentrated industries are fragile.
""", durationMin: 4),
            LessonCard(id: "re-deal", title: "Deal Analysis Workflow", body:
"""
1. Pull comps within 1 mile, last 6 months.
2. Verify expenses against actual seller P&Ls.
3. Underwrite at conservative rents.
4. Walk the property in person before LOI.
""", durationMin: 4),
        ],
        quiz: ModuleQuiz(questions: [
            QuizQuestion(prompt: "Cap rate is calculated as:", options: [
                "Annual rent ÷ price",
                "Net Operating Income ÷ price",
                "Cash flow after mortgage ÷ price",
                "Sale price ÷ purchase price"], answerIndex: 1),
            QuizQuestion(prompt: "NOI excludes which of these?", options: [
                "Property taxes", "Insurance", "Mortgage payment", "Vacancy allowance"], answerIndex: 2),
            QuizQuestion(prompt: "Stress-test rents at:", options: ["-5%", "-10%", "-20%", "-50%"], answerIndex: 2),
            QuizQuestion(prompt: "A rent-to-price ratio below 0.5% indicates a market is best for:", options: [
                "Cash flow", "Appreciation", "Short-term rentals", "House hacking"], answerIndex: 1),
            QuizQuestion(prompt: "Per the deal-analysis workflow, you should NEVER skip:", options: [
                "The Zestimate check", "Walking the property in person", "Pulling crime stats", "Calling the listing agent"], answerIndex: 1),
        ], passThreshold: pass)
    )

    private static let investing = ModuleContent(
        id: .investing,
        name: "Investing",
        emoji: "📈",
        oneLiner: "knowledge multipliers. index fundamentals. real risk framing.",
        lessons: [
            LessonCard(id: "inv-index", title: "Why Index Funds Win", body:
"""
Most active managers underperform their benchmark over 10+ years.

A 3-fund portfolio (US, international, bonds) at low cost beats 99% of active strategies. Boring is the strategy.
""", durationMin: 5),
            LessonCard(id: "inv-risk", title: "Risk vs Volatility", body:
"""
Volatility is not risk. Volatility is the price of admission.

Real risk = permanent loss of capital + not having cash you need when you need it.

— 3–6 months of expenses in cash.
— Long-term money in equities, untouched.
— Don't check daily.
""", durationMin: 4),
            LessonCard(id: "inv-tax", title: "Tax-Advantaged Accounts", body:
"""
Order of priority:
1. 401(k) up to employer match.
2. Max HSA if eligible.
3. Max Roth IRA.
4. Back to 401(k) up to limit.
5. Taxable brokerage.
""", durationMin: 5),
            LessonCard(id: "inv-greeks", title: "When Options Make Sense", body:
"""
Legitimate uses:
— Covered calls on shares you own.
— Cash-secured puts on shares you want to own at a lower price.
— Long-dated calls (LEAPS) for high conviction.

If you can't explain delta / gamma / theta / vega in one sentence each, don't trade options.
""", durationMin: 6),
        ],
        quiz: ModuleQuiz(questions: [
            QuizQuestion(prompt: "Real risk is defined as:", options: [
                "Daily price volatility",
                "Standard deviation of returns",
                "Permanent loss of capital + not having cash when you need it",
                "Beta vs the S&P 500"], answerIndex: 2),
            QuizQuestion(prompt: "First investing priority:", options: [
                "Roth IRA", "HSA", "401(k) up to employer match", "Taxable brokerage"], answerIndex: 2),
            QuizQuestion(prompt: "A 3-fund portfolio typically includes:", options: [
                "US stocks, gold, crypto",
                "US stocks, international stocks, bonds",
                "Tech, energy, healthcare",
                "Large cap, small cap, REITs"], answerIndex: 1),
            QuizQuestion(prompt: "Cash-secured puts are appropriate when:", options: [
                "You want to short the stock",
                "You want to own the underlying at a lower price",
                "You want maximum leverage",
                "You want to avoid taxes"], answerIndex: 1),
            QuizQuestion(prompt: "Recommended emergency fund:", options: [
                "1 month", "3–6 months", "12 months", "Whatever fits in your HSA"], answerIndex: 1),
        ], passThreshold: pass)
    )

    private static let aiTech = ModuleContent(
        id: .aiTech,
        name: "AI & Tech",
        emoji: "🤖",
        oneLiner: "capitalization strategies. model capabilities. tool workflows.",
        lessons: [
            LessonCard(id: "ai-leverage", title: "AI as Personal Leverage", body:
"""
AI compresses the time skilled work takes. Treat it like an intern that never sleeps.
""", durationMin: 5),
            LessonCard(id: "ai-prompting", title: "Prompting That Compounds", body:
"""
Three patterns:
1. Specify role + audience + constraint.
2. Give 1–3 examples of the format.
3. Ask the model to plan first, then execute.
""", durationMin: 5),
            LessonCard(id: "ai-tools", title: "Tool Stack", body:
"""
Worth 30 minutes to set up:
— Coding assistant in your editor.
— Model wired into inbox / docs (read-only first).
— Voice-to-text capture.
— Scheduling assistant with calendar write access.
""", durationMin: 5),
            LessonCard(id: "ai-limits", title: "Where Models Still Lie", body:
"""
Do not trust models for:
— Specific numbers without verification.
— Legal/medical advice.
— Anything where being wrong is unrecoverable.
""", durationMin: 5),
        ],
        quiz: ModuleQuiz(questions: [
            QuizQuestion(prompt: "AI primarily:", options: [
                "Replaces skilled work",
                "Compresses the time skilled work takes",
                "Generates novel research",
                "Eliminates the need for verification"], answerIndex: 1),
            QuizQuestion(prompt: "A prompting pattern that compounds:", options: [
                "Always ask multiple-choice questions",
                "Specify role + audience + constraint and ask model to plan before executing",
                "Use as few words as possible",
                "Avoid examples"], answerIndex: 1),
            QuizQuestion(prompt: "Worth 30 minutes setting up:", options: [
                "A meme generator",
                "A coding assistant inside your editor",
                "A second monitor",
                "A custom GPU rig"], answerIndex: 1),
            QuizQuestion(prompt: "When NOT to trust a model:", options: [
                "Brainstorming",
                "Drafting an email",
                "Specific citations, prices, dates without verification",
                "Summarizing a public article"], answerIndex: 2),
            QuizQuestion(prompt: "A frontier model is described as:", options: [
                "A replacement for senior engineers",
                "A search engine",
                "An intern that never sleeps",
                "A junior associate that bills hours"], answerIndex: 2),
        ], passThreshold: pass)
    )

    private static let cooking = ModuleContent(
        id: .cooking,
        name: "Cooking",
        emoji: "🍳",
        oneLiner: "high-protein meal protocols. macro optimization. real fuel.",
        lessons: [
            LessonCard(id: "cook-template", title: "The 30-30-30 Plate", body:
"""
A working template:
— 30g of protein.
— 30g of slow carbs (rice, oats, potatoes, beans).
— 30g of vegetables.

Salt + acid + fat covers most cuisines.
""", durationMin: 4),
            LessonCard(id: "cook-prep", title: "Sunday Setup", body:
"""
Two hours on Sunday saves 5 hours during the week.
— Roast 2 sheet pans of vegetables.
— Cook a pot of grains.
— Sear 1.5 lb of protein.
— Wash + prep one container of greens.
""", durationMin: 5),
            LessonCard(id: "cook-costs", title: "Cost vs Time vs Health", body:
"""
You're always trading among three: cost, time, health.

Pick a default for weekday lunches. Don't re-decide daily.
""", durationMin: 4),
            LessonCard(id: "cook-flavors", title: "Flavor Without Recipes", body:
"""
1. Brown the protein hard.
2. Finish with acid.
3. Finish with fat.
""", durationMin: 4),
        ],
        quiz: ModuleQuiz(questions: [
            QuizQuestion(prompt: "The 30-30-30 plate template is:", options: [
                "30g protein, 30g carbs, 30g vegetables",
                "30g of each macro",
                "30 minutes prep, 30 minutes cook, 30 minutes eat",
                "30% protein, 30% carbs, 30% fat"], answerIndex: 0),
            QuizQuestion(prompt: "Three universal flavor moves:", options: [
                "Salt early, salt often, salt at the end",
                "Brown the protein, finish with acid, finish with fat",
                "Use fresh herbs only",
                "Add sugar, salt, and MSG"], answerIndex: 1),
            QuizQuestion(prompt: "Sunday setup is:", options: [
                "Cooking every meal in advance",
                "Two hours of prep that saves 5 hours during the week",
                "Going out to brunch",
                "Reading recipes"], answerIndex: 1),
            QuizQuestion(prompt: "Cheapest + healthiest + slowest is:", options: [
                "Restaurant", "Pre-cooked grocery", "Cooking at home", "Meal-kit subscription"], answerIndex: 2),
            QuizQuestion(prompt: "Recipes are described as:", options: [
                "The only path to good food", "Training wheels", "Always essential", "Best when followed exactly"], answerIndex: 1),
        ], passThreshold: pass)
    )
}
