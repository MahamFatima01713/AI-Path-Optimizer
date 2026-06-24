AI Path Optimizer
Intelligent Route Planning Engine — Powered by Flask & A Search Algorithm*

https://img.shields.io/badge/status-active-success.svg
https://img.shields.io/badge/version-1.0.0-blue.svg
https://img.shields.io/badge/license-MIT-green.svg
https://img.shields.io/badge/PRs-welcome-brightgreen.svg
https://img.shields.io/badge/Python-3.8%252B-blue.svg
https://img.shields.io/badge/Flask-2.0%252B-black.svg
https://img.shields.io/badge/Made%2520with-%E2%9D%A4%EF%B8%8F-red.svg
Overview
AI Path Optimizer is an intelligent navigation system that finds the most efficient route between two points using the A Search Algorithm* with dynamic traffic estimation. Built with a Flask backend and a responsive HTML/CSS/JavaScript frontend, this full-stack web application provides real-time pathfinding with an interactive map interface.

The application visualizes routes on a Leaflet map, allows users to select start and end points via dropdowns or map clicks, and displays key metrics including distance, travel time, fuel savings, and number of stops.

🎯 Key Features
Feature	Description
🗺️ Interactive Map	Leaflet-powered map with clickable markers for node selection
⚡ A Pathfinding*	AI-driven route optimization using spatial heuristics
🚦 Traffic Modes	Toggle between Low and High traffic conditions
🚚 Vehicle Selection	Adjust route metrics for Motorcycle, Car, or Heavy Truck
📊 Real-time Metrics	Distance, time, fuel saved, and stops count
📈 Comparison Chart	Visual bar chart comparing Original vs Optimized routes
📍 Node Directory	Complete list of all network hubs with coordinates
📜 History Log	Audit trail of all route searches
🗺️ Routes Table	Active route display with status indicators
💡 AI Insights	Confidence score and efficiency messaging
📱 Responsive Design	Dark sidebar with light main content area
AI Pathfinding Engine
Core Algorithm: A* Search with Haversine Heuristic
The AI engine uses the A (A-Star) search algorithm* with an intelligent heuristic function:

python
def a_star_search(start_node, end_node, traffic_mode):
    """
    AI Pathfinding: A* Search Algorithm.
    Uses dynamic traffic weights + spatial heuristics to optimize paths.
    """
🔬 How It Works:
Component	Description
Graph Representation	Nodes (locations) connected by edges (roads) with distance weights
Heuristic Function	Haversine formula calculates straight-line distance (air distance)
Traffic Weighting	High traffic mode applies traffic_factor multiplier to edge weights
Vehicle Multiplier	Adjusts speed and fuel consumption based on vehicle type
Optimal Path Selection	Algorithm balances actual distance + heuristic estimation
Path Reconstruction	Backtracks from end to start to build the optimal route
📊 Performance Metrics:
Metric	Value
Algorithm	A* Search with Haversine Heuristic
Heuristic	Admissible & Consistent (guarantees optimal path)
Time Complexity	O(b^d) with intelligent pruning
Space Complexity	O(b^d) for open set
Average Response	< 100ms for graphs with < 100 nodes
🛠️ Technologies Used
<div align="center">
Layer	Technology	Purpose
Backend	Python 3.8+	Core logic & API
Backend Framework	Flask	RESTful API server
Frontend	HTML5	Semantic markup
Frontend Styling	CSS3	Responsive design, dark sidebar
Frontend Logic	JavaScript	Interactivity, API calls, state management
Map Library	Leaflet.js	Interactive map rendering
Chart Library	Chart.js	Comparison bar chart
Data Storage	JSON	Graph data (nodes & edges)
</div>
📦 Python Dependencies:
Flask==2.0.1
Werkzeug==2.0.1
Jinja2==3.0.1
Installation & Setup
Step 1: Clone the Repository
git clone https://github.com/MahamFatima01713/AI-Path-Optimizer.git
cd AI-Path-Optimizer
Step 2: Install Python Dependencies
bash
pip install flask
Step 3: Verify graph.json Exists
Ensure graph.json is in the same directory as app.py. The file contains:

6 nodes (Gulberg Hub, Mall Road Junction, Model Town Central, Johar Town Terminal, DHA Phase 3 Square, Barkat Market)

8 edges with distances and traffic factors

Step 4: Run the Flask Server
bash
python app.py
Step 5: Open the Application
text
Open your browser and navigate to:
http://127.0.0.1:5000
That's it! The application is now running locally. 🎉

🔧 Troubleshooting
Issue	Solution
graph.json not found	Ensure graph.json is in the same folder as app.py
Port 5000 already in use	Change port: python app.py --port=5001
index.html not found	Ensure index.html is in the same folder as app.py
ModuleNotFoundError: No module named 'flask'	Run pip install flask

📱 User Guide
How to Use the Application
🎯 Step 1: Select Start Point
Use the "Starting Point" dropdown in the sidebar
OR click a green marker on the map

📍 Step 2: Select Destination
Use the "Destination Target" dropdown in the sidebar
OR click a red marker on the map

🚦 Step 3: Select Traffic Mode
Toggle between Low or High traffic in the sidebar
High traffic applies traffic_factor multipliers to edge weights

🚚 Step 4: Select Vehicle Type (Optional)
Go to the "Vehicles" tab
Choose: Motorcycle (1.0x), Car (1.5x), or Heavy Truck (2.5x)
Adjusts speed and fuel consumption metrics

⚡ Step 5: Run AI Optimization
Click the "Run AI Optimization" button
The A* algorithm calculates the optimal path
Results appear on the map, summary cards, and chart

📊 Dashboard Metrics
Metric	Description	Display
Total Distance	Total path distance in kilometers	X.X km
Total Time	Estimated travel time	Xm or Xh Xm
Fuel Saved	Fuel savings compared to original route	X.X L
Stops	Number of nodes on the path	X

🎨 Visual Showcase
🎯 UI/UX Highlights
Dark Sidebar — Navy background (#0f172a) with white text
Light Main Content — Clean white cards on light gray background (#f8fafc)
Blue Accents — Primary actions and route highlights (#3b82f6)
Traffic Toggle — Low/High buttons with active state highlighting
Summary Cards — Four metric cards with labels and values
Comparison Chart — Bar chart comparing Original vs Optimized metrics
AI Insights Panel — Confidence score (98%) and efficiency messaging
Responsive Layout — Adapts to different screen sizes

🔮 Future Roadmap
Priority	Feature	Description
🔴 High	More Nodes	Expand graph with additional locations
🟡 Medium	Multiple Routes	Show alternative path options
🟢 Low	Route History	Save and view past route searches
🔵 Future	Real Traffic API	Integrate live traffic data
🤝 Contributing
Contributions are welcome! 🎉

How to Contribute
🍴 Fork the repository
🌿 Create a branch (git checkout -b feature/AmazingFeature)
🖊️ Make your changes
✅ Test your changes thoroughly
📝 Commit (git commit -m 'Add some AmazingFeature')
📤 Push (git push origin feature/AmazingFeature)
🔄 Open a Pull Request

Acknowledgments

🗺️ OpenStreetMap — For free map tiles via Leaflet
🧠 A Pathfinding Algorithm* — Core AI logic
🚀 Flask — Lightweight backend framework
📊 Chart.js — Comparison chart visualization
💻 GitHub — For hosting and collaboration tools

👩‍💻 Author
Maham Fatima
Frontend Developer & AI Enthusiast
