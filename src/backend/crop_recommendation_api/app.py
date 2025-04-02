from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import numpy as np

app = FastAPI()

# ✅ Load trained model, encoder, and scaler
try:
    model = joblib.load("crop_recommendation_model.pkl")
    encoder = joblib.load("encoder.pkl")  # OneHotEncoder for categorical features
    scaler = joblib.load("scaler.pkl")  # StandardScaler for numerical features
    crop_labels = model.classes_  # Extract labels from trained model
except Exception as e:
    print("🔴 Error loading model:", str(e))
    model, encoder, scaler, crop_labels = None, None, None, None

# ✅ Define expected feature names
expected_features = ["Crop Category", "District", "Season", "Yield (MT/ha)"]

@app.get("/")
def home():
    return {"message": "✅ Crop Recommendation API is Running Successfully"}

@app.post("/recommend")
def recommend_crop(user_input: dict):
    """Processes user input and returns the recommended crop."""
    try:
        if None in (model, encoder, scaler, crop_labels):
            raise HTTPException(status_code=500, detail="🔴 Model or preprocessors not loaded correctly")

        # ✅ Ensure all required fields are present
        for key in expected_features:
            if key not in user_input:
                raise HTTPException(status_code=400, detail=f"🔴 Missing required input field: {key}")

        # ✅ Convert input dictionary into DataFrame
        input_data = pd.DataFrame([{key: user_input[key] for key in expected_features}])

        # ✅ Encode categorical features (Crop Category, District, Season)
        categorical_features = ["Crop Category", "District", "Season"]
        input_encoded = encoder.transform(input_data[categorical_features])
        input_encoded_df = pd.DataFrame(input_encoded, columns=encoder.get_feature_names_out())

        # ✅ Fix: Ensure "Yield (MT/ha)" is a single float
        try:
            yield_mt_ha = np.array(float(user_input["Yield (MT/ha)"])).reshape(1, -1)  # Reshape correctly
            yield_scaled = scaler.transform(yield_mt_ha)[0][0]  # Extract single value
        except Exception as e:
            print("🔴 Yield Processing Error:", str(e))
            raise HTTPException(status_code=500, detail=f"Error in Yield Scaling: {str(e)}")

        # ✅ Add scaled yield to the dataframe
        input_encoded_df["Yield (MT/ha)"] = yield_scaled

        # ✅ Ensure column alignment with model training data
        missing_cols = set(model.feature_names_in_) - set(input_encoded_df.columns)
        for col in missing_cols:
            input_encoded_df[col] = 0
        input_encoded_df = input_encoded_df[model.feature_names_in_]  # Ensure correct column order

        # ✅ Fix: Reshape input for prediction
        model_input = input_encoded_df.values.reshape(1, -1)

        # ✅ Make Prediction
        predicted_crop_index = model.predict(model_input)[0]
        recommended_crop = crop_labels[int(predicted_crop_index)]  # Convert index to crop name

        return {"Recommended Crop": recommended_crop}

    except KeyError as e:
        print(f"🔴 Missing key in request: {e}")
        raise HTTPException(status_code=400, detail=f"Missing required field: {str(e)}")
    except Exception as e:
        print("🔴 Error processing request:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
