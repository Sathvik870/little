import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix

# -------------------------------------------------
# PAGE CONFIG
# -------------------------------------------------
st.set_page_config(
    page_title="Diabetes Prediction using EHR",
    layout="centered"
)

# -------------------------------------------------
# TITLE ONLY
# -------------------------------------------------
st.title("Diabetes Prediction using Electronic Health Records")

# -------------------------------------------------
# LOAD DATA
# -------------------------------------------------
data = pd.read_csv("diabetes_012_health_indicators_BRFSS2015.csv")

# -------------------------------------------------
# BINARY CONVERSION (for user-friendly prediction)
# 0 = No Diabetes, 1 & 2 = Diabetes
# -------------------------------------------------
data['Diabetes_Binary'] = data['Diabetes_012'].apply(lambda x: 1 if x > 0 else 0)

features = ['BMI', 'Age', 'HighBP', 'HighChol', 'Smoker', 'PhysActivity']
X = data[features]
y = data['Diabetes_Binary']

# -------------------------------------------------
# TRAIN MODEL (ONCE)
# -------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)

# -------------------------------------------------
# BUTTONS FOR EDA
# -------------------------------------------------
st.subheader("Exploratory Data Analysis")

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("Diabetes Distribution"):
        fig, ax = plt.subplots()
        sns.countplot(x=data['Diabetes_Binary'], ax=ax)
        ax.set_xticklabels(["No Diabetes", "Diabetes"])
        st.pyplot(fig)

with col2:
    if st.button("BMI Distribution"):
        fig, ax = plt.subplots()
        sns.histplot(data["BMI"], bins=30, kde=True, ax=ax)
        st.pyplot(fig)

with col3:
    if st.button("Correlation Heatmap"):
        fig, ax = plt.subplots(figsize=(6,4))
        sns.heatmap(data[features + ['Diabetes_Binary']].corr(), cmap="coolwarm", ax=ax)
        st.pyplot(fig)

# -------------------------------------------------
# PREDICTION FORM
# -------------------------------------------------
st.subheader("Diabetes Risk Prediction")

with st.form("prediction_form"):
    bmi = st.number_input("BMI", min_value=10.0, max_value=60.0, value=25.0)
    age = st.slider("Age Category (1–13)", 1, 13, 5)
    highbp = st.selectbox("High Blood Pressure", [0, 1])
    highchol = st.selectbox("High Cholesterol", [0, 1])
    smoker = st.selectbox("Smoker", [0, 1])
    physactivity = st.selectbox("Physically Active", [0, 1])

    submit = st.form_submit_button("Predict")

if submit:
    input_data = pd.DataFrame([[
        bmi, age, highbp, highchol, smoker, physactivity
    ]], columns=features)

    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled)[0]

    st.subheader("Prediction Result")

    if prediction == 1:
        st.error("High Risk: The patient is likely to have Diabetes.")
    else:
        st.success("Low Risk: The patient is unlikely to have Diabetes.")







