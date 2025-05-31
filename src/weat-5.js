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
    def __init__(self, root):
        self.root = root
        self.root.title("Weather Widget")
        
        # Set up the main frame
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Weather data display
        self.weather_label = ttk.Label(self.main_frame, text="Loading weather data...")
        self.weather_label.grid(row=0, column=0, pady=10)
        
        # Loading spinner
        self.spinner = ttk.Progressbar(self.main_frame, mode="indeterminate")
        self.spinner.grid(row=1, column=0, pady=10)
        
        # Unit toggle buttons
        self.temp_unit = tk.StringVar(value="C")
        self.speed_unit = tk.StringVar(value="km/h")
        
        ttk.Radiobutton(self.main_frame, text="°C", variable=self.temp_unit, value="C", command=self.update_display).grid(row=2, column=0, sticky=tk.W)
        ttk.Radiobutton(self.main_frame, text="°F", variable=self.temp_unit, value="F", command=self.update_display).grid(row=2, column=1, sticky=tk.W)
        ttk.Radiobutton(self.main_frame, text="km/h", variable=self.speed_unit, value="km/h", command=self.update_display).grid(row=3, column=0, sticky=tk.W)
        ttk.Radiobutton(self.main_frame, text="mph", variable=self.speed_unit, value="mph", command=self.update_display).grid(row=3, column=1, sticky=tk.W)
        
        # Weather icon (placeholder for now)
        self.weather_icon = ttk.Label(self.main_frame, text="🌤")
        self.weather_icon.grid(row=4, column=0, pady=10)
        
        # Contextual tip
        self.tip_label = ttk.Label(self.main_frame, text="")
        self.tip_label.grid(row=5, column=0, columnspan=2, pady=10)
        
        # Load saved units from localStorage (simulated with a file)
        self.load_units()
        
        # Start fetching weather data
        self.weather_data = None
        self.fetch_weather()

    def load_units(self):
        try:
            with open("units.json", "r") as f:
                units = json.load(f)
                self.temp_unit.set(units["temp"])
                self.speed_unit.set(units["speed"])
        except FileNotFoundError:
            pass

    def save_units(self):
        units = {
            "temp": self.temp_unit.get(),
            "speed": self.speed_unit.get()
        }
        with open("units.json", "w") as f:
            json.dump(units, f)

    def fetch_weather(self):
        self.spinner.start()
        threading.Thread(target=self._fetch_weather_thread, daemon=True).start()

    def _fetch_weather_thread(self):
        try:
            # Try to get location using IP
            g = geocoder.ip('me')
            lat, lon = g.latlng
        except:
            # If IP geolocation fails, use a default location (e.g., New York City)
            lat, lon = 40