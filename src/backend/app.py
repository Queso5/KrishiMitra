from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd

# Load the trained model
model = joblib.load("xgboost_multioutput.pkl")

# Expected feature list
expected_features = [
    "District", "Crop", "Crop Type", "Year", "Area Sown (ha)", 
    "Production (MT)", "Yield (MT/ha)", "Rainfall (mm)", "Temperature (°C)", 
    "Humidity (%)", "Market Arrival (MT)", "MSP (INR/quintal)", "Export Demand (MT)", 
    "Lag Farm Gate Price (INR/quintal)", "Seasonal Index", "Soil Moisture (%)", 
    "Fertilizer Usage (kg/ha)", "Pesticide Usage (kg/ha)", "Govt Procurement (%)", 
    "Supply Chain Disruptions", "Rolling Avg Farm Gate Price", "Rolling Avg Wholesale Price", 
    "Rolling Avg Retail Price", "Inflation Rate (%)", "GDP Growth Rate (%)", 
    "Currency Exchange Rate (INR/USD)", "Seasonal Demand Index", "Price Volatility Index", 
    "Lag 2M Farm Gate Price", "Lag 3M Farm Gate Price", "Lag 2M Wholesale Price", 
    "Lag 3M Wholesale Price", "Lag 2M Retail Price", "Lag 3M Retail Price", 
    "Month_May-Aug", "Month_Sep-Dec", "Soil Type_Loamy", "Soil Type_Sandy", "Soil Type_Silt"
]

# Default values for missing features
default_values = {feature: 0 for feature in expected_features}

# Mapping district and crop names to IDs
district_mapping = {"Pune": 1, "Nashik": 2, "Aurangabad": 3, "Nagpur": 4, "Mumbai": 5,}
crop_mapping = {"Wheat": 1, "Rice": 2, "Maize": 3, "Soybean": 4, "Sugarcane": 5,
                "Barley": 6, "Cotton": 7, "Pulses": 8}
crop_type_mapping = {"Vegetables": 1, "Fruits": 2, "Cashcrops": 3, "Cereals": 4}  # cereals=grains

# Initialize FastAPI
app = FastAPI()

@app.get("/")
def home():
    return {"message": "XGBoost Model API is Running"}

@app.post("/predict")
def predict_price(user_input: dict):
    """Receives JSON input and returns price predictions"""
    try:
        # Convert District, Crop, and Crop Type Names to IDs
        if user_input["District"] in district_mapping:
            user_input["District"] = district_mapping[user_input["District"]]
        else:
            raise HTTPException(status_code=400, detail="Invalid District Name")

        if user_input["Crop"] in crop_mapping:
            user_input["Crop"] = crop_mapping[user_input["Crop"]]
        else:
            raise HTTPException(status_code=400, detail="Invalid Crop Name")

        if user_input["Crop Type"] in crop_type_mapping:
            user_input["Crop Type"] = crop_type_mapping[user_input["Crop Type"]]
        else:
            raise HTTPException(status_code=400, detail="Invalid Crop Type")

        # Convert input to DataFrame
        input_df = pd.DataFrame([user_input])

        # Fill missing features
        for feature in expected_features:
            if feature not in input_df:
                input_df[feature] = default_values.get(feature, 0)

        # Reorder columns
        input_df = input_df[expected_features]

        # Get predictions
        prediction = model.predict(input_df)

        return {
            "Farm Gate Price (INR/quintal)": float(prediction[0][0]),
            "Wholesale Price (INR/quintal)": float(prediction[0][1]),
            "Retail Price (INR/quintal)": float(prediction[0][2])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
