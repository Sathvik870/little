import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, accuracy_score
import uvicorn

# -------------------------------------------------
# App Initialization and CORS
# -------------------------------------------------
app = FastAPI(
    title="Diabetes Prediction API",
    description="API for diabetes prediction and dataset analytics.",
    version="1.0.0"
)

# Allow requests from our React frontend (which will run on http://localhost:3000)
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

# -------------------------------------------------
# Pydantic Models for Data Validation
# -------------------------------------------------
class PredictionInput(BaseModel):
    BMI: float
    Age: int
    HighBP: int
    HighChol: int
    Smoker: int
    PhysActivity: int

# -------------------------------------------------
# Machine Learning Model Training (on startup)
# -------------------------------------------------
# We'll store models and reports in a dictionary to be accessed by endpoints
ml_models = {}

@app.on_event("startup")
def load_and_train_models():
    """
    This function is executed when the FastAPI application starts.
    It loads the data, preprocesses it, and trains all ML models.
    """
    print("Loading data and training models...")
    data = pd.read_csv("diabetes_012_health_indicators_BRFSS2015.csv")
    
    # Convert target variable to binary (0 = No Diabetes, 1 = Diabetes)
    data['Diabetes_Binary'] = data['Diabetes_012'].apply(lambda x: 1 if x > 0 else 0)
    ml_models['full_data'] = data # Store for dashboard analytics

    # Define features and target for the model
    features = ['BMI', 'Age', 'HighBP', 'HighChol', 'Smoker', 'PhysActivity']
    X = data[features]
    y = data['Diabetes_Binary']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    ml_models['scaler'] = scaler # Save the scaler

    # --- Train and evaluate models ---
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
        
        # Store the trained model
        ml_models[name] = model
        
        # Generate and store the classification report
        report = classification_report(y_test, y_pred, output_dict=True)
        reports[name] = report
    
    ml_models['reports'] = reports
    print("Models trained and reports generated successfully.")

# -------------------------------------------------
# API Endpoints
# -------------------------------------------------
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
    diabetes_counts = data['Diabetes_Binary'].value_counts().to_dict()

    # 2. Correlation of General Health with Diabetes
    gen_health_diabetes = data.groupby('GenHlth')['Diabetes_Binary'].value_counts(normalize=True).unstack().fillna(0)
    gen_health_data = {
        'labels': [f'Health Level {int(i)}' for i in gen_health_diabetes.index],
        'diabetes_percentage': (gen_health_diabetes[1] * 100).tolist() # Percentage of people with diabetes
    }
    
    # 3. Age distribution
    age_distribution = data['Age'].value_counts().sort_index().to_dict()
    
    # 4. BMI distribution
    bmi_distribution = pd.cut(data['BMI'], bins=range(10, 71, 5)).value_counts().sort_index()
    bmi_data = {
        'labels': [str(b) for b in bmi_distribution.index],
        'counts': bmi_distribution.values.tolist()
    }
    
    return {
        "diabetes_distribution": {"labels": ["No Diabetes", "Diabetes"], "values": [diabetes_counts.get(0, 0), diabetes_counts.get(1, 0)]},
        "health_vs_diabetes": gen_health_data,
        "age_distribution": {"labels": [f'Age Cat {int(k)}' for k in age_distribution.keys()], "values": list(age_distribution.values())},
        "bmi_distribution": bmi_data
    }


@app.post("/predict")
def predict(input_data: PredictionInput):
    """
    Accepts user input and makes a prediction using the Logistic Regression model.
    """
    # Get the required scaler and model
    scaler = ml_models.get('scaler')
    model = ml_models.get('Logistic Regression')
    
    if not scaler or not model:
        return {"error": "Model or scaler not available."}

    # Create a DataFrame from the input
    input_df = pd.DataFrame([input_data.dict()])
    
    # Scale the input data
    input_scaled = scaler.transform(input_df)
    
    # Make prediction
    prediction_proba = model.predict_proba(input_scaled)
    prediction = model.predict(input_scaled)[0]
    
    return {
        "prediction": int(prediction),
        "prediction_label": "High Risk of Diabetes" if prediction == 1 else "Low Risk of Diabetes",
        "confidence_score": f"{prediction_proba[0][prediction]:.2%}"
    }

# This part is for running the app directly for testing
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)