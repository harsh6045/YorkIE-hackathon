import requests
import json
from fuzzywuzzy import process

# OpenWeatherMap API key (replace with your actual key)
API_KEY = "your_api_key_here"

# Base URL for OpenWeatherMap API
BASE_URL = "http://api.openweathermap.org/data/2.5/"

# Load recent searches from local storage
def load_recent_searches():
    try:
        with open('recent_searches.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Save recent searches to local storage
def save_recent_searches(searches):
    with open('recent_searches.json', 'w') as f:
        json.dump(searches, f)

# Fetch city suggestions from OpenWeatherMap API
def get_city_suggestions(query):
    url = f"{BASE_URL}find?q={query}&type=like&sort=population&cnt=5&appid={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return [city['name'] for city in data.get('list', [])]
    return []

# Fetch weather data for a specific city
def get_weather_data(city):
    url = f"{BASE_URL}weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

# Implement fuzzy search
def fuzzy_search(query, cities):
    return process.extract(query, cities, limit=5)

# Auto-detect and correct typos
def correct_typo(query, cities):
    best_match = process.extractOne(query, cities)
    if best_match[1] > 80:  # Threshold for typo correction
        return best_match[0]
    return query

# Main function to handle user input and display results
def weather_widget():
    recent_searches = load_recent_searches()
    
    while True:
        query = input("Enter a city name (or 'q' to quit): ").strip()
        
        if query.lower() == 'q':
            break
        
        # Attempt typo correction
        corrected_query = correct_typo(query, recent_searches)
        if corrected_query != query:
            print(f"Did you mean: {corrected_query}?")
            query = corrected_query
        
        suggestions = get_city_suggestions(query)
        
        if not suggestions:
            print(f"No cities found for '{query}'")
            continue
        
        # Display suggestions with fuzzy search
        fuzzy_results = fuzzy_search(query, suggestions)
        for i, (city, score) in enumerate(fuzzy_results, 1):
            print(f"{i}. {city}")
        
        choice = input("Select a city (number) or press Enter to search again: ")
        
        if choice.isdigit() and 1 <= int(choice) <= len(fuzzy_results):
            selected_city = fuzzy_results[int(choice) - 1][0]
            weather_data = get_weather_data(selected_city)
            
            if weather_data:
                print(f"\nWeather in {selected_city}:")
                print(f"Temperature: {weather_data['main']['temp']}°C")
                print(f"Description: {weather_data['weather'][0]['description']}")
                
                # Add to recent searches
                if selected_city not in recent_searches:
                    recent_searches.insert(0, selected_city)
                    recent_searches = recent_searches[:5]  # Keep only top 5
                    save_recent_searches(recent_searches)
            else:
                print("Failed to fetch weather data. Please try again.")

if __name__ == "__main__":
    weather_widget()
