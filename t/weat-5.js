Here's the Python code for the weather widget:

```python
import requests
import json
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import tkinter as tk
from tkinter import ttk
import threading
import time

# OpenWeatherMap API key (replace with your own)
API_KEY = "your_api_key_here"

class WeatherWidget:
    def __init__(self, master):
        self.master = master
        self.master.title("Weather Widget")
        
        # Initialize variables
        self.location = tk.StringVar()
        self.temperature = tk.StringVar()
        self.humidity = tk.StringVar()
        self.wind = tk.StringVar()
        self.description = tk.StringVar()
        self.units = tk.StringVar(value="metric")  # Default to metric
        
        # Create and place widgets
        self.create_widgets()
        
        # Start location detection
        self.detect_location()

    def create_widgets(self):
        # Location entry and search button
        tk.Entry(self.master, textvariable=self.location).pack()
        tk.Button(self.master, text="Search", command=self.get_weather).pack()
        
        # Weather info labels
        tk.Label(self.master, textvariable=self.temperature).pack()
        tk.Label(self.master, textvariable=self.humidity).pack()
        tk.Label(self.master, textvariable=self.wind).pack()
        tk.Label(self.master, textvariable=self.description).pack()
        
        # Unit toggle
        tk.Radiobutton(self.master, text="°C", variable=self.units, value="metric", command=self.get_weather).pack()
        tk.Radiobutton(self.master, text="°F", variable=self.units, value="imperial", command=self.get_weather).pack()
        
        # Loading indicator
        self.loading_label = tk.Label(self.master, text="Loading...")
        
        # Contextual tip label
        self.tip_label = tk.Label(self.master, text="")
        self.tip_label.pack()

    def detect_location(self):
        def _detect():
            geolocator = Nominatim(user_agent="weather_widget")
            try:
                location = geolocator.geocode("")  # Empty string for IP-based location
                if location:
                    self.location.set(f"{location.latitude},{location.longitude}")
                    self.get_weather()
                else:
                    self.location.set("Location not found")
            except GeocoderTimedOut:
                self.location.set("Timeout. Please enter location manually.")
        
        threading.Thread(target=_detect).start()

    def get_weather(self):
        self.loading_label.pack()
        
        def _fetch_weather():
            try:
                url = f"http://api.openweathermap.org/data/2.5/weather?q={self.location.get()}&appid={API_KEY}&units={self.units.get()}"
                response = requests.get(url)
                data = json.loads(response.text)
                
                temp_unit = "°C" if self.units.get() == "metric" else "°F"
                speed_unit = "km/h" if self.units.get() == "metric" else "mph"
                
                self.temperature.set(f"Temperature: {data['main']['temp']}{temp_unit}")
                self.humidity.set(f"Humidity: {data['main']['humidity']}%")
                self.wind.set(f"Wind: {data['wind']['speed']} {speed_unit}")
                self.description.set(f"Description: {data['weather'][0]['description']}")
                
                self.show_contextual_tip(data['weather'][0]['main'])
            except Exception as e:
                self.temperature.set("Error fetching weather data")
            finally: