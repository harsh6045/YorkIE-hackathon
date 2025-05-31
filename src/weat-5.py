Here's a clean, well-commented Python code that implements the described weather widget functionality:

```python
import requests
import json
import geocoder
from datetime import datetime
import tkinter as tk
from tkinter import ttk
import threading
import time

# OpenWeatherMap API key (replace with your own)
API_KEY = "your_api_key_here"

class WeatherWidget:
    def __init__(self, master):
        self.master = master
        master.title("Weather Widget")

        # Initialize UI elements
        self.location_label = tk.Label(master, text="Location: Detecting...")
        self.location_label.pack()

        self.weather_frame = tk.Frame(master)
        self.weather_frame.pack()

        self.temp_label = tk.Label(self.weather_frame, text="Temperature: --")
        self.temp_label.pack()

        self.humidity_label = tk.Label(self.weather_frame, text="Humidity: --")
        self.humidity_label.pack()

        self.wind_label = tk.Label(self.weather_frame, text="Wind: --")
        self.wind_label.pack()

        self.icon_label = tk.Label(self.weather_frame, text="Icon: --")
        self.icon_label.pack()

        self.tip_label = tk.Label(master, text="")
        self.tip_label.pack()

        # Unit toggle buttons
        self.temp_unit = tk.StringVar(value="C")
        self.wind_unit = tk.StringVar(value="km/h")

        temp_toggle = ttk.Checkbutton(master, text="°F", variable=self.temp_unit, 
                                      onvalue="F", offvalue="C", command=self.update_display)
        temp_toggle.pack()

        wind_toggle = ttk.Checkbutton(master, text="mph", variable=self.wind_unit, 
                                      onvalue="mph", offvalue="km/h", command=self.update_display)
        wind_toggle.pack()

        # Loading indicator
        self.loading_label = tk.Label(master, text="Loading...")
        self.loading_label.pack()

        # Start weather update thread
        self.weather_data = None
        threading.Thread(target=self.update_weather, daemon=True).start()

    def get_location(self):
        """Attempt to get user's location using IP geolocation"""
        try:
            g = geocoder.ip('me')
            return g.latlng
        except:
            # If geolocation fails, return None (will prompt for manual input)
            return None

    def fetch_weather(self, lat, lon):
        """Fetch weather data from OpenWeatherMap API"""
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        return json.loads(response.text)

    def update_weather(self):
        """Background thread to update weather data"""
        while True:
            self.loading_label.config(text="Loading...")
            location = self.get_location()
            if location:
                lat, lon = location
                self.weather_data = self.fetch_weather(lat, lon)
                self.master.after(0, self.update_display)
            else:
                self.master.after(0, self.prompt_manual_location)
            self.loading_label.config(text="")
            time.sleep(600)  # Update every 10 minutes

    def prompt_manual_location(self):
        """Prompt user for manual location input"""
        # (Implement a dialog or entry field for manual input)
        pass

    def update_display(self):
        """Update UI with current weather data"""
        if self.weather_data:
            self.location_label.config(text=f"Location: {self.weather_data['name']}")
            
            temp = self.weather_data['main']['temp']
            if self.temp_