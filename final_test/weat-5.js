Here's the Python code for the weather widget:

```python
import requests
import json
import geocoder
from tkinter import *
from tkinter import ttk
import threading
import time

# OpenWeatherMap API key (replace with your own)
API_KEY = "your_api_key_here"

class WeatherWidget:
    def __init__(self, master):
        self.master = master
        master.title("Weather Widget")

        # Initialize variables
        self.temperature = StringVar()
        self.humidity = StringVar()
        self.wind_speed = StringVar()
        self.description = StringVar()
        self.icon = StringVar()
        self.loading = BooleanVar(value=True)
        self.units = StringVar(value=self.load_units())

        # Create and pack widgets
        self.create_widgets()

        # Start weather update thread
        threading.Thread(target=self.update_weather, daemon=True).start()

    def create_widgets(self):
        # Loading spinner
        self.spinner = ttk.Progressbar(self.master, mode='indeterminate')
        self.spinner.pack(pady=10)

        # Weather info display
        ttk.Label(self.master, textvariable=self.temperature).pack()
        ttk.Label(self.master, textvariable=self.humidity).pack()
        ttk.Label(self.master, textvariable=self.wind_speed).pack()
        ttk.Label(self.master, textvariable=self.description).pack()

        # Unit toggle
        ttk.Radiobutton(self.master, text="°C, km/h", variable=self.units, 
                        value="metric", command=self.toggle_units).pack()
        ttk.Radiobutton(self.master, text="°F, mph", variable=self.units, 
                        value="imperial", command=self.toggle_units).pack()

    def get_location(self):
        try:
            g = geocoder.ip('me')
            return g.latlng
        except:
            # Fallback to manual input
            return [40.7128, -74.0060]  # Default: New York City

    def fetch_weather(self, lat, lon):
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units={self.units.get()}"
        response = requests.get(url)
        return json.loads(response.text)

    def update_weather(self):
        while True:
            self.loading.set(True)
            self.spinner.start()

            lat, lon = self.get_location()
            data = self.fetch_weather(lat, lon)

            self.temperature.set(f"Temperature: {data['main']['temp']}°{'C' if self.units.get() == 'metric' else 'F'}")
            self.humidity.set(f"Humidity: {data['main']['humidity']}%")
            self.wind_speed.set(f"Wind Speed: {data['wind']['speed']} {'km/h' if self.units.get() == 'metric' else 'mph'}")
            self.description.set(f"Description: {data['weather'][0]['description']}")
            self.icon.set(data['weather'][0]['icon'])

            self.loading.set(False)
            self.spinner.stop()

            # Add contextual tips
            self.add_contextual_tip(data['weather'][0]['main'])

            time.sleep(600)  # Update every 10 minutes

    def toggle_units(self):
        self.save_units()
        self.update_weather()

    def load_units(self):
        # Load units from localStorage (simulated with a file)
        try:
            with open('units.txt', 'r') as f:
                return f.read().strip()
        except FileNotFoundError:
            return 'metric'

    def save_units(self):
        # Save units to localStorage (simulated with a