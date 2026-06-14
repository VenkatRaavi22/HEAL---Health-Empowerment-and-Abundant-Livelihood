import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def clean_data(df):
    for col in df.columns:
        if df[col].dtype == object:
            # simple mapping for categorical data
            mapping = {'Y':1, 'N':0, 'Yes':1, 'No':0, 'yes':1, 'no':0, 'High':2, 'Moderate':1, 'Low':0, 'P':1, 'Positive':1, 'Negative':0}
            df[col] = df[col].map(mapping).fillna(df[col])
            # if still object after mapping, drop it or coerce
            if df[col].dtype == object:
                try:
                    df[col] = pd.Categorical(df[col]).codes
                except:
                    pass
    return df.fillna(0)

symptom_ids = {
    'Irregular periods': 1, 'Missed periods': 2, 'Acne': 3, 'Hair fall': 4,
    'Excess facial hair': 5, 'Sudden weight gain': 6, 'Unexplained weight loss': 7,
    'Fatigue': 8, 'Mood swings': 9, 'Anxiety': 10, 'Depression': 11,
    'Sleep disturbance': 12, 'Cold intolerance': 13, 'Heat intolerance': 14,
    'Bloating': 15, 'Severe cramps': 16, 'Low activity': 17, 'Heavy bleeding': 18
}

sql = "-- Data-Driven Weights Generated via Random Forest Analysis\n"
sql += "INSERT INTO diseases (disease_name) SELECT 'Endometriosis' WHERE NOT EXISTS (SELECT 1 FROM diseases WHERE disease_name='Endometriosis');\n"
sql += "DELETE FROM disease_symptom_weights;\n"

# 1. PCOS
try:
    df = pd.read_excel('database/PCOS DataSet.xlsx')
    df = clean_data(df)
    features = {
        'Gain_weight': ['Sudden weight gain'],
        'Excess_facial_hair': ['Excess facial hair'],
        'Losing_hair': ['Hair fall'],
        'Pimple_face': ['Acne'],
        'Mood_swing_normal': ['Mood swings'],
        'Depress': ['Depression'],
        'Mental_stress': ['Anxiety'],
        'Insomnia': ['Sleep disturbance'],
        ' Ex_pain_abdominal': ['Severe cramps'],
        'Slow_activity': ['Low activity']
    }
    # Ensure columns exist
    cols = [c for c in features.keys() if c in df.columns]
    y = df['PCOS'].astype(int)
    X = df[cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    rf = RandomForestClassifier(random_state=42).fit(X, y)
    for col, imp in zip(X.columns, rf.feature_importances_):
        weight = max(1, int(imp * 100))
        for sym in features[col]:
            sql += f"INSERT INTO disease_symptom_weights (disease_id, symptom_id, weight) VALUES ((SELECT disease_id FROM diseases WHERE disease_name='PCOS'), {symptom_ids[sym]}, {weight});\n"
except Exception as e:
    print('PCOS Error:', e)

# 2. Thyroid
try:
    df = pd.read_csv('database/Thyroid_Dataset_Resampled.csv')
    df = clean_data(df)
    features = {
        'Fatigue': ['Fatigue'],
        'Weight_Change': ['Sudden weight gain', 'Unexplained weight loss'],
        'Hair_Loss': ['Hair fall'],
        'Sensitivity_to_Cold_or_Heat': ['Cold intolerance', 'Heat intolerance'],
        'Depression_or_Anxiety': ['Depression', 'Anxiety']
    }
    cols = [c for c in features.keys() if c in df.columns]
    if 'Thyroid_Risk_Level' in df.columns:
        y = pd.Categorical(df['Thyroid_Risk_Level']).codes
    else:
        y = df.iloc[:, -1]
    X = df[cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    rf = RandomForestClassifier(random_state=42).fit(X, y)
    for col, imp in zip(X.columns, rf.feature_importances_):
        weight = max(1, int(imp * 100))
        for sym in features[col]:
            sql += f"INSERT INTO disease_symptom_weights (disease_id, symptom_id, weight) VALUES ((SELECT disease_id FROM diseases WHERE disease_name='Thyroid'), {symptom_ids[sym]}, {weight});\n"
except Exception as e:
    print('Thyroid Error:', e)

# 3. Endometriosis
try:
    df = pd.read_csv('database/structured_endometriosis_data.csv')
    df = clean_data(df)
    features = {
        'Menstrual_Irregularity': ['Irregular periods', 'Heavy bleeding'],
        'Chronic_Pain_Level': ['Severe cramps', 'Bloating']
    }
    cols = [c for c in features.keys() if c in df.columns]
    y = pd.Categorical(df['Diagnosis']).codes
    X = df[cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    rf = RandomForestClassifier(random_state=42).fit(X, y)
    for col, imp in zip(X.columns, rf.feature_importances_):
        weight = max(1, int(imp * 100))
        for sym in features[col]:
            sql += f"INSERT INTO disease_symptom_weights (disease_id, symptom_id, weight) VALUES ((SELECT disease_id FROM diseases WHERE disease_name='Endometriosis'), {symptom_ids[sym]}, {weight});\n"
except Exception as e:
    print('Endometriosis Error:', e)

with open('database/update_weights.sql', 'w') as f:
    f.write(sql)
print("Analysis complete. SQL file generated at database/update_weights.sql")
