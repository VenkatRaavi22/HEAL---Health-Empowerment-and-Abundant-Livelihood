// chatController.js — HEAL AI Health Assistant (Rule-based Engine)

const knowledgeBase = [
    // ─── Greetings ───────────────────────────────────────────────
    {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'howdy'],
        reply: `Hello! 👋 I'm HEAL's AI Health Assistant. I'm here to help you understand your hormonal health, PCOD, risk scores, diet, yoga, and more.\n\nYou can ask me things like:\n• What is PCOD?\n• What does my risk score mean?\n• What foods should I eat?\n• Suggest some yoga poses for PCOD`
    },

    // ─── PCOD/PCOS definition ────────────────────────────────────
    {
        keywords: ['what is pcod', 'what is pcos', 'define pcod', 'explain pcod', 'pcod meaning', 'pcos meaning', 'about pcod', 'about pcos'],
        reply: `🌸 **PCOD (Polycystic Ovarian Disease)** is a hormonal condition affecting women of reproductive age.\n\n**Key Facts:**\n• The ovaries produce excess androgens (male hormones)\n• Multiple small cysts form on the ovaries\n• Affects 8–13% of women worldwide\n• Can disrupt menstrual cycles, fertility, and metabolism\n\n**PCOD vs PCOS:** PCOS (Polycystic Ovarian Syndrome) is a more severe form of the same condition and is associated with metabolic complications like insulin resistance.\n\n💡 Early detection and lifestyle changes can significantly manage symptoms.`
    },

    // ─── PCOD Symptoms ──────────────────────────────────────────
    {
        keywords: ['symptoms', 'signs of pcod', 'signs of pcos', 'how do i know if i have pcod', 'pcod symptoms', 'pcos symptoms'],
        reply: `🔍 **Common PCOD/PCOS Symptoms:**\n\n**Hormonal:**\n• Irregular or absent periods\n• Excess facial/body hair (hirsutism)\n• Acne or oily skin\n• Thinning hair or hair loss\n\n**Physical:**\n• Weight gain, especially around the abdomen\n• Difficulty losing weight\n• Darkening of skin (acanthosis nigricans)\n\n**Other:**\n• Mood swings, anxiety, or depression\n• Fatigue and low energy\n• Difficulty getting pregnant\n\n⚠️ You may not have all symptoms. If you experience 2 or more, consider consulting a gynecologist.`
    },

    // ─── Causes ─────────────────────────────────────────────────
    {
        keywords: ['cause', 'reason', 'why do i have pcod', 'why pcod happens', 'what causes pcod'],
        reply: `🔬 **Causes of PCOD/PCOS:**\n\nThe exact cause isn't fully understood, but key factors include:\n\n1. **Insulin Resistance** – Excess insulin triggers the ovaries to produce more androgens\n2. **Genetics** – Family history increases your risk by up to 50%\n3. **Hormonal Imbalance** – Elevated LH, androgens, or low FSH\n4. **Inflammation** – Low-grade chronic inflammation stimulates androgen production\n5. **Lifestyle Factors** – Sedentary lifestyle, high-sugar diet, stress\n\n💡 Addressing insulin resistance through diet and exercise is the #1 lifestyle intervention.`
    },

    // ─── Risk Score Interpretation ───────────────────────────────
    {
        keywords: ['risk score', 'risk percentage', 'what does my risk mean', 'risk level', 'what is high risk', 'risk result', 'my risk', 'interpret risk', 'risk of'],
        reply: `📊 **Understanding Your HEAL Risk Score:**\n\n| Risk Level | Score Range | What It Means |\n|---|---|---|\n| 🟢 Low | 0–30% | Minimal symptoms; maintain healthy habits |\n| 🟡 Moderate | 31–60% | Some concerning symptoms; lifestyle changes recommended |\n| 🔴 High | 61–100% | Multiple strong indicators; consult a specialist |\n\n**Important:** This score is a wellness awareness tool — not a medical diagnosis. It's based on your logged symptoms and cycle data.\n\n💡 Log your symptoms regularly for more accurate tracking!`
    },

    // ─── Diet / Nutrition ────────────────────────────────────────
    {
        keywords: ['diet', 'food', 'eat', 'nutrition', 'what should i eat', 'meal', 'foods to avoid', 'avoid food', 'dietary'],
        reply: `🥗 **PCOD-Friendly Nutrition Guide:**\n\n**✅ Foods to Include:**\n• High-fiber: leafy greens, broccoli, lentils\n• Anti-inflammatory: turmeric, ginger, berries\n• Lean protein: fish, eggs, legumes\n• Low-GI carbs: oats, quinoa, brown rice\n• Healthy fats: avocado, nuts, olive oil\n\n**❌ Foods to Limit/Avoid:**\n• Refined sugar & sugary drinks\n• White bread, pasta, processed foods\n• Fried and fast foods\n• Excessive dairy (for some women)\n• Alcohol and caffeine\n\n**💧 Hydration:** Aim for 8–10 glasses of water daily.\n\n💡 A low-GI anti-inflammatory diet is the most evidence-backed approach for PCOD management.`
    },

    // ─── Yoga ───────────────────────────────────────────────────
    {
        keywords: ['yoga', 'poses', 'asana', 'yoga for pcod', 'yoga for pcos', 'which yoga', 'yoga poses'],
        reply: `🧘 **Best Yoga Poses for PCOD:**\n\n1. **Butterfly Pose (Baddha Konasana)** – Stimulates ovaries & improves pelvic blood flow\n2. **Supported Bridge Pose (Setu Bandhasana)** – Balances thyroid & reduces stress hormones\n3. **Boat Pose (Navasana)** – Strengthens core & stimulates abdominal organs\n4. **Child's Pose (Balasana)** – Calms the nervous system, reduces cortisol\n5. **Cat-Cow Stretch** – Massages reproductive organs\n6. **Sun Salutation (Surya Namaskar)** – Full-body sequence that helps with hormone balance\n\n⏱️ Recommended: 20–30 minutes, 5 days a week.\n\n💡 Use HEAL's **Guided Session** feature for step-by-step yoga with live posture feedback!`
    },

    // ─── Exercise ────────────────────────────────────────────────
    {
        keywords: ['exercise', 'workout', 'physical activity', 'gym', 'cardio', 'strength', 'walk', 'running', 'fitness'],
        reply: `💪 **Exercise Guide for PCOD:**\n\n**Best Exercise Types:**\n• **Cardio (Moderate):** Brisk walking, cycling, swimming — 30 min/day\n• **Strength Training:** 2–3x/week to improve insulin sensitivity\n• **HIIT (Short bursts):** Effective for fat loss but avoid overdoing it\n• **Mind-Body:** Yoga, pilates — reduces cortisol\n\n**Tips:**\n• Aim for 150 minutes of moderate activity per week\n• Avoid over-exercising — it can spike cortisol and worsen symptoms\n• Consistency > intensity\n• Morning exercise helps regulate blood sugar all day\n\n💡 Start with HEAL's guided session for structured, step-by-step workouts!`
    },

    // ─── Ayurveda ────────────────────────────────────────────────
    {
        keywords: ['ayurveda', 'ayurvedic', 'herbal', 'natural remedy', 'herbs', 'home remedy', 'traditional'],
        reply: `🌿 **Ayurvedic Support for PCOD:**\n\n**Powerful Herbs:**\n• **Shatavari** – Balances female hormones, supports ovarian health\n• **Ashwagandha** – Reduces cortisol and stress-induced hormonal imbalance\n• **Triphala** – Detoxifies and improves digestion\n• **Cinnamon** – Improves insulin sensitivity naturally\n• **Spearmint Tea** – Shown to reduce androgen levels\n\n**Daily Practices:**\n• Warm turmeric milk (Golden Milk) before bed\n• Sesame oil pulling for toxin removal\n• Favor warm, cooked foods over raw and cold\n• Sleep by 10 PM to align with natural circadian rhythm\n\n⚠️ Always consult your doctor before starting herbal supplements, especially if on medication.`
    },

    // ─── Menstrual Cycle ─────────────────────────────────────────
    {
        keywords: ['period', 'cycle', 'menstrual', 'irregular period', 'missed period', 'late period', 'menstruation', 'flow'],
        reply: `📅 **Menstrual Cycle & PCOD:**\n\n**Normal Cycle:** 21–35 days.\n\n**PCOD-related disruptions:**\n• Cycles shorter than 21 days or longer than 35 days = irregular\n• Missed periods (oligomenorrhea) — fewer than 8 cycles/year\n• Absent periods (amenorrhea) — no period for 3+ months\n• Heavy or very light flow\n\n**Why it happens:** Hormonal imbalance prevents regular ovulation, disrupting the shedding cycle.\n\n**What helps:**\n• Regular exercise\n• Weight management (even 5–10% loss can restore cycles)\n• Stress reduction\n• Doctor-prescribed hormonal support if needed\n\n💡 Track your cycle in HEAL's **Cycle Monitor** to spot patterns!`
    },

    // ─── Mental Health ───────────────────────────────────────────
    {
        keywords: ['stress', 'anxiety', 'depression', 'mood', 'mental health', 'emotional', 'sad', 'feel bad', 'overwhelmed'],
        reply: `💙 **Mental Health & Hormonal Wellness:**\n\nHormonal imbalances from PCOD directly affect mood and mental health.\n\n**PCOD & Mental Health Links:**\n• High androgen levels → anxiety and irritability\n• Irregular cycles → unpredictable mood swings\n• Weight gain → body image stress\n• Insulin resistance → brain fog and low energy\n\n**Coping Strategies:**\n• 🧘 Daily meditation (even 5–10 minutes helps)\n• 📝 Journaling symptoms and moods\n• 🌙 Prioritizing 7–8 hours of sleep\n• 🚶 Regular gentle movement\n• 👥 Support groups or counseling\n\n💡 Be kind to yourself — managing PCOD is a journey, not a race. You're doing great by using HEAL! 🌸`
    },

    // ─── Weight Management ────────────────────────────────────────
    {
        keywords: ['weight', 'obesity', 'fat', 'lose weight', 'weight loss', 'bmi', 'overweight', 'belly fat'],
        reply: `⚖️ **Weight Management with PCOD:**\n\nWeight and PCOD create a complex cycle — excess weight worsens insulin resistance, which worsens PCOD symptoms.\n\n**Key Strategies:**\n• Even **5–10% body weight reduction** can significantly restore hormonal balance\n• Focus on **fat loss**, not just weight loss\n• Avoid crash diets — they spike cortisol\n• Aim for **0.5–1 kg/week** sustainable loss\n\n**Effective Approach:**\n✅ Low-GI, anti-inflammatory diet\n✅ Strength training 3x/week\n✅ 8,000–10,000 steps daily\n✅ Sleep 7–8 hours\n✅ Manage stress\n\n💡 Track your daily steps in HEAL's **Dashboard** for consistent habit building!`
    },

    // ─── Doctor Advice ────────────────────────────────────────────
    {
        keywords: ['doctor', 'specialist', 'gynecologist', 'consult', 'see a doctor', 'medical', 'hospital', 'diagnosis', 'test', 'ultrasound', 'blood test'],
        reply: `🩺 **When to See a Doctor:**\n\n**Consult a gynecologist if you experience:**\n• Periods absent for 3+ months\n• Severe pelvic pain\n• Uncontrolled acne or hair loss\n• Difficulty conceiving\n• Sudden significant weight gain\n\n**Diagnostic Tests for PCOD:**\n• Pelvic ultrasound (to detect cysts)\n• Blood tests: FSH, LH, testosterone, insulin, thyroid panel\n• AMH (Anti-Müllerian Hormone) level\n\n**Specialists to See:**\n• **Gynecologist/OB-GYN** – Primary care for PCOD\n• **Endocrinologist** – For insulin resistance or thyroid issues\n• **Dietitian** – For personalized nutrition plans\n\n💡 Use HEAL's **Consult Specialist** feature to find doctors near you!`
    },

    // ─── Medication ───────────────────────────────────────────────
    {
        keywords: ['medication', 'medicine', 'metformin', 'birth control', 'pill', 'treatment', 'drug', 'supplement'],
        reply: `💊 **Common PCOD Treatments:**\n\n**Lifestyle (First-line treatment):**\n• Diet, exercise, and weight management\n\n**Medications (prescribed by doctor only):**\n• **Metformin** – Improves insulin sensitivity\n• **Oral Contraceptive Pills** – Regulates periods and reduces acne/hair growth\n• **Clomiphene** – Induces ovulation if trying to conceive\n• **Spironolactone** – Reduces excess hair growth and acne\n\n**Supplements (consult doctor first):**\n• Inositol (Myo-inositol + D-chiro-inositol)\n• Vitamin D\n• Omega-3 fatty acids\n• Magnesium\n\n⚠️ Never self-medicate. All treatments should be supervised by your healthcare provider.\n\n💡 Track your medications in HEAL's **Medication** section!`
    },

    // ─── Fertility ────────────────────────────────────────────────
    {
        keywords: ['fertility', 'pregnant', 'pregnancy', 'conceive', 'getting pregnant', 'ovulation', 'trying to conceive'],
        reply: `🌱 **PCOD & Fertility:**\n\nPCOD is one of the most common but **treatable** causes of female infertility.\n\n**How PCOD Affects Fertility:**\n• Irregular ovulation makes conception harder\n• Hormonal imbalance affects egg quality\n• Uterine lining may not develop properly\n\n**Good News:**\nMost women with PCOD **can and do get pregnant** with the right support.\n\n**Steps to Improve Fertility:**\n1. ✅ Reach a healthy weight (even small improvements help)\n2. ✅ Track ovulation (use apps or kits)\n3. ✅ Take prescribed medications (Clomiphene, Letrozole)\n4. ✅ Consider assisted reproduction (IUI, IVF) if needed\n5. ✅ Reduce stress and prioritize sleep\n\n💡 Consult a reproductive endocrinologist for a personalized fertility plan.`
    },

    // ─── Thyroid ──────────────────────────────────────────────────
    {
        keywords: ['thyroid', 'hypothyroid', 'hyperthyroid', 'tsh', 'thyroid and pcod'],
        reply: `🦋 **Thyroid & PCOD Connection:**\n\nThyroid disorders and PCOD often coexist — up to **22–34% of women with PCOD** also have thyroid issues.\n\n**Hypothyroidism Overlap Symptoms:**\n• Fatigue, weight gain, hair loss\n• Irregular periods\n• Depression and brain fog\n\n**Key Differences:**\n• PCOD: High androgens, insulin resistance, cysts on ovaries\n• Hypothyroidism: Low thyroid hormone (T3/T4), high TSH\n\n**What to Do:**\n• Get a full thyroid panel (TSH, T3, T4) when diagnosed with PCOD\n• Both conditions need to be managed together for best results\n• Selenium-rich foods (Brazil nuts, fish) support thyroid health\n\n💡 Mention thyroid symptoms when you see your specialist.`
    },

    // ─── Sleep ────────────────────────────────────────────────────
    {
        keywords: ['sleep', 'insomnia', 'tired', 'fatigue', 'rest', 'sleep quality'],
        reply: `😴 **Sleep & Hormonal Health:**\n\nSleep is a critical but often overlooked hormonal regulator.\n\n**PCOD & Sleep Disruption:**\n• Hormonal imbalance → poor sleep quality\n• Up to 80% of obese women with PCOD have sleep apnea\n• Poor sleep increases cortisol → worsens insulin resistance\n\n**Sleep Hygiene Tips:**\n• 🌙 Aim for 7–9 hours per night\n• 📵 No screens 1 hour before bed\n• 🌡️ Keep bedroom cool and dark\n• ☕ Avoid caffeine after 2 PM\n• 🧘 5-minute breathing exercise before sleep\n\n**Supplement Support (consult doctor):**\n• Magnesium glycinate promotes restful sleep\n• Ashwagandha reduces nighttime cortisol\n\n💡 Good sleep amplifies the effects of diet and exercise by 2–3x.`
    },

    // ─── Streak / Habit ───────────────────────────────────────────
    {
        keywords: ['streak', 'habit', 'progress', 'track', 'routine', 'consistent', 'daily'],
        reply: `🔥 **Building Healthy Habits with HEAL:**\n\nConsistency is the #1 predictor of long-term health improvement.\n\n**HEAL Features for Habit Building:**\n• 📊 **Dashboard** – View your streak and daily overview\n• 📝 **Log Health** – Daily symptom & mood tracking\n• 💊 **Medication** – Never miss a dose\n• 📈 **Progress** – Visualize your trends over time\n\n**The 21-Day Rule:**\nScience shows it takes ~21 days to form a habit. Start with:\n1. Log your health every morning\n2. Take a 20-minute walk\n3. Drink 8 glasses of water\n\n💡 Small, consistent actions create lasting hormonal health. You've got this! 🌟`
    }
];

// Default fallback
const DEFAULT_REPLY = `I'm here to help with your hormonal health questions! 🌸\n\nYou can ask me about:\n• PCOD/PCOS symptoms and causes\n• Understanding your risk score\n• Diet and nutrition tips\n• Yoga and exercise for PCOD\n• Ayurvedic remedies\n• Menstrual cycle health\n• Fertility and hormonal balance\n• When to see a doctor\n\nTry asking something like: *"What foods should I avoid?"* or *"Suggest yoga poses for PCOD"*`;

exports.handleMessage = (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ reply: 'Please send a valid message.' });
    }

    const normalized = message.toLowerCase().trim();

    // Match against knowledge base
    for (const entry of knowledgeBase) {
        const matched = entry.keywords.some(kw => normalized.includes(kw));
        if (matched) {
            return res.json({ reply: entry.reply });
        }
    }

    // Fallback
    return res.json({ reply: DEFAULT_REPLY });
};
