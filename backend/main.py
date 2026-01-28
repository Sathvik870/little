import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report
import uvicorn

app = FastAPI(
    title="Diabetes Prediction API",
    description="API for diabetes prediction and dataset analytics.",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
]

FEATURES_FOR_RULES = ['BMI', 'Age', 'HighBP', 'HighChol', 'Smoker', 'PhysActivity']

PREDIABETES_THRESHOLDS = {
    'BMI': 30, 'Age': 9, 'HighBP': 1, 'HighChol': 1, 'Smoker': 1, 'PhysActivity': 0 
}

DIABETES_THRESHOLDS = {
    'BMI': 31, 'Age': 10, 'HighBP': 1, 'HighChol': 1, 'Smoker': 1, 'PhysActivity': 0
}

RECOMMENDATIONS = {
    'BMI': "Reduce body weight through a balanced diet and regular exercise.",
    'Age': "Regular health screening and lifestyle monitoring is recommended, especially with advancing age.",
    'HighBP': "Control blood pressure through medication, a low-salt diet, and exercise.",
    'HighChol': "Reduce cholesterol intake, consider a diet rich in fiber, and consult a healthcare provider.",
    'Smoker': "Quit smoking to significantly reduce diabetes-related complications and improve overall health.",
    'PhysActivity': "Increase physical activity to at least 150 minutes of moderate-intensity exercise per week."
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    BMI: float
    Age: int
    HighBP: int
    HighChol: int
    Smoker: int
    PhysActivity: int

ml_models = {}

@app.on_event("startup")
def load_and_train_models():
    print("Loading data and training models for multi-class classification...")
    data = pd.read_csv("output2.csv")
    data['Diabetes_012'] = data['Diabetes_012'].astype(int)
    ml_models['full_data'] = data

    features = ['BMI', 'Age', 'HighBP', 'HighChol', 'Smoker', 'PhysActivity']
    X = data[features]
    y = data['Diabetes_012'] 
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y 
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    ml_models['scaler'] = scaler

    models_to_train = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        "Decision Tree": DecisionTreeClassifier(random_state=42, class_weight='balanced'),
        "Random Forest": RandomForestClassifier(random_state=42, class_weight='balanced')
    }
    
    reports = {}
    for name, model in models_to_train.items():
        print(f"Training {name}...")
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        ml_models[name] = model
        report = classification_report(y_test, y_pred, output_dict=True)
        reports[name] = report
    
    ml_models['reports'] = reports
    print("Multi-class models trained successfully.")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Diabetes Prediction API"}

@app.get("/models/performance")
def get_model_performance():
    """
    Returns the classification reports for all trained models.
    """
    if "reports" in ml_models:
        return ml_models["reports"]
    return {"error": "Models are not trained yet. Please wait."}

@app.get("/dashboard/analytics")
def get_dashboard_analytics():
    """
    Provides expanded aggregated data for the new dashboard layout.
    """
    data = ml_models.get('full_data')
    if data is None:
        return {"error": "Data not loaded yet."}

    males_df = data[data['Sex'] == 1]
    total_males = len(males_df)
    
    male_smoker_perc = (males_df['Smoker'].value_counts(normalize=True).get(1, 0) * 100) if total_males > 0 else 0
    male_alcohol_perc = (males_df['HvyAlcoholConsump'].value_counts(normalize=True).get(1, 0) * 100) if total_males > 0 else 0

    total_people = len(data)
    phys_activity_perc = (data['PhysActivity'].value_counts(normalize=True).get(1, 0) * 100) if total_people > 0 else 0
    high_chol_perc = (data['HighChol'].value_counts(normalize=True).get(1, 0) * 100) if total_people > 0 else 0

    kpi_stats = {
        "phys_activity_percentage": round(phys_activity_perc, 2),
        "high_chol_percentage": round(high_chol_perc, 2),
        "male_smoker_percentage": round(male_smoker_perc, 2),
        "male_alcohol_percentage": round(male_alcohol_perc, 2)
    }

    diabetes_counts = data['Diabetes_012'].value_counts().sort_index()
    diabetes_distribution = {
        "labels": ["No Diabetes", "Pre-diabetes", "Diabetes"],
        "values": [int(v) for v in diabetes_counts.reindex([0, 1, 2], fill_value=0)]
    }

    heatmap_features = ['Diabetes_012', 'BMI', 'Age', 'HighBP', 'HighChol', 'PhysActivity', 'GenHlth', 'MentHlth']
    corr_matrix = data[heatmap_features].corr()
    correlation_data = {"labels": corr_matrix.columns.tolist(), "data": corr_matrix.values.tolist()}
    
    gender_counts = data['Sex'].value_counts()
    gender_bar_chart_data = {
        "labels": ["Female", "Male"],
        "values": [int(gender_counts.get(0, 0)), int(gender_counts.get(1, 0))]
    }
    
    health_metrics_avg = {
        "labels": ["General Health (1-5)", "Mental Health Days (0-30)", "Physical Health Days (0-30)"],
        "values": [
            float(data['GenHlth'].mean()),
            float(data['MentHlth'].mean()),
            float(data['PhysHlth'].mean())
        ]
    }

    diabetes_by_age_df = data.groupby('Age')['Diabetes_012'].value_counts(normalize=True).unstack().fillna(0)
    for col in [0, 1, 2]:
        if col not in diabetes_by_age_df.columns:
            diabetes_by_age_df[col] = 0
            
    diabetes_by_age = {
        "labels": [f"Age Cat {int(age)}" for age in diabetes_by_age_df.index],
        "no_diabetes_perc": (diabetes_by_age_df[0] * 100).tolist(),
        "prediabetes_perc": (diabetes_by_age_df[1] * 100).tolist(),
        "diabetes_perc": (diabetes_by_age_df[2] * 100).tolist(),
    }
    return {
        "kpi_stats": kpi_stats,
        "diabetes_distribution": diabetes_distribution,
        "correlation_data": correlation_data,
        "gender_bar_chart_data": gender_bar_chart_data,
        "health_metrics_avg": health_metrics_avg,
        "diabetes_by_age": diabetes_by_age
    }

def get_ai_recommendations(input_dict: dict):
    prediabetes_hits = []
    diabetes_hits = []

    for feature in FEATURES_FOR_RULES:
        is_prediabetes_risk = (
            feature != 'PhysActivity' and input_dict[feature] >= PREDIABETES_THRESHOLDS[feature]
        ) or (
            feature == 'PhysActivity' and input_dict[feature] == PREDIABETES_THRESHOLDS[feature]
        )
        if is_prediabetes_risk:
            prediabetes_hits.append(feature)

        is_diabetes_risk = (
            feature != 'PhysActivity' and input_dict[feature] >= DIABETES_THRESHOLDS[feature]
        ) or (
            feature == 'PhysActivity' and input_dict[feature] == DIABETES_THRESHOLDS[feature]
        )
        if is_diabetes_risk:
            diabetes_hits.append(feature)

    if len(diabetes_hits) >= 4:
        condition = "High Concern (Diabetes Indicators)"
        affected_features = diabetes_hits
    elif len(prediabetes_hits) >= 3:
        condition = "Medium Concern (Pre-diabetes Indicators)"
        affected_features = prediabetes_hits
    elif len(prediabetes_hits) > 0:
        condition = "Low Concern (At Risk)"
        affected_features = prediabetes_hits
    else:
        condition = "Healthy Profile"
        affected_features = []

    if affected_features:
        explanation = "The following factors contributed to this assessment: " + ", ".join(affected_features) + "."
        recommendation_list = [RECOMMENDATIONS[f] for f in affected_features]
    else:
        explanation = "Your inputs indicate a healthy profile according to our rule-based assessment."
        recommendation_list = ["Continue to maintain your healthy lifestyle choices."]

    return {
        "condition": condition,
        "explanation": explanation,
        "recommendations": recommendation_list
    }

@app.post("/predict")
def predict(input_data: PredictionInput):
    scaler = ml_models.get('scaler')
    model = ml_models.get('Logistic Regression')
    if not scaler or not model: return {"error": "Model not available."}

    input_df = pd.DataFrame([input_data.dict()])
    input_scaled = scaler.transform(input_df)
    
    probabilities = model.predict_proba(input_scaled)[0]
    predicted_class = int(np.argmax(probabilities))
    confidence = round(np.max(probabilities) * 100, 2)

    risk_levels = {0: "Low Risk", 1: "Medium Risk (Pre-diabetes)", 2: "High Risk (Diabetes)"}
    
    model_prediction_result = {
        "predicted_class": predicted_class,
        "risk_level": risk_levels.get(predicted_class, "Unknown"),
        "confidence": f"{confidence}%"
    }
    
    ai_recommendation_result = get_ai_recommendations(input_data.dict())
    return {
        "model_prediction": model_prediction_result,
        "ai_recommendation": ai_recommendation_result
    }
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)