from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from flask_cors import CORS
import pandas as pd
from sklearn.preprocessing import StandardScaler
import pickle


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
model_total_ipc_crimes = joblib.load('trained_model.joblib')

# Load your dataset
dataset = pd.read_csv('district wise crime.csv')

@app.route('/get_crime_data', methods=['POST'])
def get_crime_data():
    # print("Received POST request")
    # print("Request data:", request.get_json())
    try:
        data=request.get_json()
        state=data['state']
        district=data['district']
        year=int(data['year'])
        print(data)
        # # Get input parameters from the POST request
        # state = request.form['state']
        # district = request.form['district']
        # year = int(request.form['year'])
        # print(state,district,year)
        # Filter the dataset based on the input parameters
        filtered_data = dataset[(dataset['STATE/UT'] == state) & (dataset['DISTRICT'] == district) & (dataset['YEAR'] == year)]
        # print(filtered_data)
        # Extract relevant columns for response
        # response_data = filtered_data[['MURDER', 'ATTEMPT TO MURDER', 'RAPE', 'KIDNAPPING & ABDUCTION']]
        response_data = filtered_data

        # Convert response data to JSON
        response_json = response_data.to_json(orient='records')

        return response_json
        # return jsonify({"message":"api is working"})
    except Exception as e:
        return jsonify({'error': str(e)})

# Define a route for making predictions
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the input data from the request
        data = request.get_json()
        user_district=data['district']
        user_target_year=int(data['year'])
        final_prediction=-1

        # Make predictions using the loaded model
        df = pd.read_csv('district_wise_crime_with_growth_rate.csv')

        if user_target_year >= 2013:
            district_data = df[df['DISTRICT'] == user_district]

            if not district_data.empty:
                print("i am inside the if of if")
                features = district_data[['GROWTH RATE', 'YEAR']]
                target_total_ipc_crimes = district_data['TOTAL IPC CRIMES']

                model_file_path = 'trained_model.pkl'
                with open(model_file_path, 'rb') as model_file:
                    loaded_model = pickle.load(model_file)
                scaler = StandardScaler()
                X_scaled = scaler.fit_transform(features)

                user_prediction_features = [[user_target_year - 2013, user_target_year]]
                user_prediction_scaled = scaler.transform(user_prediction_features)
                user_prediction_total_ipc_crimes = loaded_model.predict(user_prediction_scaled)

                rounded_predicted_value = round(user_prediction_total_ipc_crimes[0])
                print(rounded_predicted_value)
                final_prediction=rounded_predicted_value

            else:
                final_prediction=f"No data found for the district {user_district}. Please enter a valid district."

        elif user_target_year < 2013:
            actual_total_ipc_crimes = df[(df['DISTRICT'] == user_district) & (df['YEAR'] == user_target_year)]['TOTAL IPC CRIMES'].values
            if actual_total_ipc_crimes:
                final_prediction=actual_total_ipc_crimes
            else:
                final_prediction=f"No data found for the district {user_district}.in {user_target_year} Please enter a valid year."

        else:
            print("\nInvalid target year. Please enter a valid year.")

            actual_total_ipc_crimes = df[(df['DISTRICT'] == user_district) & (df['YEAR'] == user_target_year)]['TOTAL IPC CRIMES'].values

            if actual_total_ipc_crimes:
                final_prediction=actual_total_ipc_crimes
            else:
                final_prediction=f"No data found for the district {user_district}in {user_target_year}. Please enter a valid year."


        # Return the predictions as JSON
        return jsonify({'predictions': final_prediction})

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/crime_data/<state>/<district>', methods=['GET'])
def get_crime_data_by_district(state,district):
    # Filter data based on the requested district
    filtered_data = dataset[(dataset['STATE/UT'].str.lower()==state.lower())&(dataset['DISTRICT'].str.lower() == district.lower())]
    print(filtered_data)
    # Convert the filtered data to JSON format
    json_data = filtered_data.to_json(orient='records')

    return jsonify(json_data)


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)