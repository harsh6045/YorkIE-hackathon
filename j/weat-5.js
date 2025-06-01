Here's the Python code for the weather widget:

```python
import requests
import json
import geocoder
from tkinter import *
from tkinter import ttk
import time
import threading

# OpenWeatherMap API key (replace with your own)
API_KEY = "your_api_key_here"

class WeatherWidget:
    def __init__(self, master):
        self.master = master
        self.master.title("Weather Widget")
        
        # Initialize variables
        self.temperature = StringVar()
        self.humidity = StringVar()
        self.wind_speed = StringVar()
        self.description = StringVar()
        self.location = StringVar()
        
        # Create UI elements
        self.create_widgets()
        
        # Load user preferences
        self.load_preferences()
        
        # Fetch weather data
        self.fetch_weather()

    def create_widgets(self):
        # Main frame
        main_frame = ttk.Frame(self.master, padding="10")
        main_frame.grid(row=0, column=0, sticky=(N, W, E, S))
        
        # Location
        ttk.Label(main_frame, textvariable=self.location).grid(row=0, column=0, columnspan=2)
        
        # Temperature
        ttk.Label(main_frame, textvariable=self.temperature).grid(row=1, column=0)
        self.temp_unit = ttk.Button(main_frame, text="°C", command=self.toggle_temp_unit)
        self.temp_unit.grid(row=1, column=1)
        
        # Humidity
        ttk.Label(main_frame, textvariable=self.humidity).grid(row=2, column=0, columnspan=2)
        
        # Wind
        ttk.Label(main_frame, textvariable=self.wind_speed).grid(row=3, column=0)
        self.wind_unit = ttk.Button(main_frame, text="km/h", command=self.toggle_wind_unit)
        self.wind_unit.grid(row=3, column=1)
        
        # Description
        ttk.Label(main_frame, textvariable=self.description).grid(row=4, column=0, columnspan=2)
        
        # Loading indicator
        self.loading = ttk.Progressbar(main_frame, orient=HORIZONTAL, length=200, mode='indeterminate')
        self.loading.grid(row=5, column=0, columnspan=2)

    def fetch_weather(self):
        self.loading.start()
        threading.Thread(target=self._fetch_weather_thread).start()

    def _fetch_weather_thread(self):
        try:
            # Get location
            g = geocoder.ip('me')
            lat, lon = g.latlng
            
            # Fetch weather data
            url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
            response = requests.get(url)
            data = json.loads(response.text)
            
            # Update UI
            self.location.set(f"{data['name']}, {data['sys']['country']}")
            self.temperature.set(f"{data['main']['temp']:.1f}°C")
            self.humidity.set(f"Humidity: {data['main']['humidity']}%")
            self.wind_speed.set(f"{data['wind']['speed']} km/h")
            self.description.set(data['weather'][0]['description'].capitalize())
            
            # Show contextual tip
            self.show_tip(data['weather'][0]['main'])
            
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            self.location.set("Error: Unable to fetch weather data")
        
        self.loading.stop()

    def toggle_temp_unit(self):
        current = self.temperature.get()
        if "°C" in current