import pandas as pd
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
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(random_state=42)
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
    Provides aggregated data from the full dataset for the dashboard.
    """
    data = ml_models.get('full_data')
    if data is None:
        return {"error": "Data not loaded yet."}

    # 1. Diabetes distribution
    diabetes_counts = data['Diabetes_012'].value_counts().sort_index()
    diabetes_distribution = {
        "labels": ["No Diabetes", "Pre-diabetes", "Diabetes"],
        # FIX #2: Convert numpy.int64 to Python int
        "values": [
            int(diabetes_counts.get(0, 0)),
            int(diabetes_counts.get(1, 0)),
            int(diabetes_counts.get(2, 0))
        ]
    }

    # FIX #1: Use 'Diabetes_012' instead of 'Diabetes_Binary'
    gen_health_diabetes = data.groupby('GenHlth')['Diabetes_012'].value_counts(normalize=True).unstack().fillna(0)
    
    # Check if all columns (0, 1, 2) exist after unstacking, add them if not
    for col in [0, 1, 2]:
        if col not in gen_health_diabetes.columns:
            gen_health_diabetes[col] = 0

    gen_health_data = {
        'labels': [f'Health Level {int(i)}' for i in gen_health_diabetes.index],
        'no_diabetes_percentage': (gen_health_diabetes[0] * 100).tolist(),
        'prediabetes_percentage': (gen_health_diabetes[1] * 100).tolist(),
        'diabetes_percentage': (gen_health_diabetes[2] * 100).tolist()
    }
    
    # 3. Age distribution
    age_distribution = data['Age'].value_counts().sort_index()
    # FIX #2: Convert numpy.int64 values to Python int
    age_data = {
        "labels": [f'Age Cat {int(k)}' for k in age_distribution.keys()],
        "values": [int(v) for v in age_distribution.values]
    }
    
    # 4. BMI distribution
    bmi_distribution = pd.cut(data['BMI'], bins=range(10, 71, 5)).value_counts().sort_index()
    # FIX #2: Convert numpy.int64 values to Python int
    bmi_data = {
        'labels': [str(b) for b in bmi_distribution.index],
        'counts': [int(v) for v in bmi_distribution.values]
    }
    
    return {
        "diabetes_distribution": diabetes_distribution,
        "health_vs_diabetes": gen_health_data,
        "age_distribution": age_data,
        "bmi_distribution": bmi_data
    }

@app.post("/predict")
def predict(input_data: PredictionInput):
    scaler = ml_models.get('scaler')
    model = ml_models.get('Logistic Regression')
    if not scaler or not model: return {"error": "Model not available."}

    input_df = pd.DataFrame([input_data.dict()])
    input_scaled = scaler.transform(input_df)
    
    prediction = model.predict(input_scaled)[0]
    prediction_proba = model.predict_proba(input_scaled)
    prediction_labels = {
        0: "Low Risk: No Diabetes",
        1: "Medium Risk: Pre-diabetes",
        2: "High Risk: Diabetes"
    }
    
    return {
        "prediction": int(prediction),
        "prediction_label": prediction_labels.get(prediction, "Unknown"),
        "confidence_score": f"{prediction_proba[0][prediction]:.2%}"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)