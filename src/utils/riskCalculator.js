export const MASTER_SYMPTOMS = [
    "Irregular periods",
    "Missed periods",
    "Acne",
    "Hair fall",
    "Excess facial hair",
    "Sudden weight gain",
    "Unexplained weight loss",
    "Fatigue",
    "Mood swings",
    "Anxiety",
    "Depression",
    "Sleep disturbance",
    "Cold intolerance",
    "Heat intolerance",
    "Bloating",
    "Severe cramps",
    "Low activity",
    "Heavy bleeding"
];

const PCOS_WEIGHTS = {
    "Irregular periods": 3,
    "Missed periods": 3,
    "Acne": 2,
    "Excess facial hair": 3,
    "Sudden weight gain": 2,
    "Hair fall": 1,
    "Low activity": 1
};

const THYROID_WEIGHTS = {
    "Fatigue": 3,
    "Sudden weight gain": 2,
    "Hair fall": 2,
    "Cold intolerance": 3,
    "Depression": 2,
    "Irregular periods": 1,
    "Mood swings": 1
};

const TOTAL_PCOS_SCORE = 15;
const TOTAL_THYROID_SCORE = 14;

export const calculateRisk = (symptoms) => {
    let pcosScore = 0;
    let thyroidScore = 0;

    symptoms.forEach(symptom => {
        if (PCOS_WEIGHTS[symptom]) pcosScore += PCOS_WEIGHTS[symptom];
        if (THYROID_WEIGHTS[symptom]) thyroidScore += THYROID_WEIGHTS[symptom];
    });

    const pcosRisk = Math.round((pcosScore / TOTAL_PCOS_SCORE) * 100);
    const thyroidRisk = Math.round((thyroidScore / TOTAL_THYROID_SCORE) * 100);

    return {
        pcos: {
            percentage: pcosRisk,
            ...getRiskLevel(pcosRisk)
        },
        thyroid: {
            percentage: thyroidRisk,
            ...getRiskLevel(thyroidRisk)
        }
    };
};

const getRiskLevel = (percentage) => {
    if (percentage <= 30) return { label: 'Low', color: 'green' };
    if (percentage <= 60) return { label: 'Moderate', color: 'yellow' };
    return { label: 'High', color: 'red' };
};
