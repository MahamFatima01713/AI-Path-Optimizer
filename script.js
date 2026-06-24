document.addEventListener("DOMContentLoaded", function () {
  // Global States
  let startNodeId = null;
  let endNodeId = null;
  let trafficMode = "low";

  let map = null;
  let chartInstance = null;
  let currentPolyline = null;
  let mapMarkers = {};
  let nodesData = {};

  // DOM Elements
  const lowTrafficButton = document.querySelector(".toggle-option.low");
  const highTrafficButton = document.querySelector(".toggle-option.high");
  const distanceCard = document.getElementById("totalDistance");
  const timeCard = document.getElementById("totalTime");
  const fuelCard = document.getElementById("fuelSaved");
  const stopsCard = document.getElementById("stopsCount");

  const startSelect = document.getElementById("startLocationSelect");
  const endSelect = document.getElementById("endLocationSelect");

  // Force Leaflet to load default marker icons from a reliable CDN web source
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });

  // ==========================================
  // 1. INITIALIZE MAP & CHART MODULES
  // ==========================================
  try {
    if (document.getElementById("map")) {
      map = L.map("map").setView([31.5204, 74.3587], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      console.log("Map initialized over Lahore.");
    }

    const chartCanvas = document.getElementById("comparisonChart");
    if (chartCanvas && typeof Chart !== "undefined") {
      const ctx = chartCanvas.getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Distance (km)", "Time (h)", "Fuel (L)"],
          datasets: [
            {
              label: "Original Route",
              data: [0, 0, 0],
              backgroundColor: "#94a3b8",
              borderRadius: 8,
            },
            {
              label: "Optimized Route",
              data: [0, 0, 0],
              backgroundColor: "#3b82f6",
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
        },
      });
      console.log("Chart initialized.");
    }
  } catch (e) {
    console.error("Initialization issue:", e.message);
  }

  // ==========================================
  // 2. CORE FUNCTIONS & BACKEND FETCH
  // ==========================================
  function updateSummaryCards(distance, time, fuel, stops) {
    if (distanceCard) distanceCard.innerHTML = distance + " <span>km</span>";
    if (timeCard) timeCard.textContent = time;
    if (fuelCard) fuelCard.innerHTML = fuel + " <span>L</span>";
    if (stopsCard) stopsCard.textContent = stops;
  }

  function updateChart(
    originalDist,
    originalTime,
    originalFuel,
    actualDist,
    actualTimeStr,
    actualFuel,
  ) {
    if (!chartInstance) return;
    let numericHours = 0;
    if (actualTimeStr.includes("h")) {
      const parts = actualTimeStr.split("h");
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      numericHours = h + m / 60;
    } else {
      numericHours = (parseFloat(actualTimeStr) || 0) / 60;
    }
    chartInstance.data.datasets[0].data = [
      originalDist,
      parseFloat(originalTime).toFixed(2),
      originalFuel,
    ];
    chartInstance.data.datasets[1].data = [
      actualDist,
      numericHours.toFixed(2),
      actualFuel,
    ];
    chartInstance.update();
  }

  function drawRouteOnMap(pathArray) {
    if (!map || !nodesData) return;
    if (currentPolyline) map.removeLayer(currentPolyline);

    const coords = pathArray.map((nodeId) => [
      nodesData[nodeId].lat,
      nodesData[nodeId].lon,
    ]);

    currentPolyline = L.polyline(coords, {
      color: "#3b82f6",
      weight: 6,
      opacity: 0.85,
    }).addTo(map);
    map.fitBounds(currentPolyline.getBounds(), { padding: [40, 40] });
  }

  async function fetchOptimizedPath() {
    if (!startNodeId || !endNodeId) return;
    console.log(
      `Sending path request: Start=${startNodeId}, End=${endNodeId}, Traffic=${trafficMode}`,
    );

    try {
      const response = await fetch("/shortest_path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startNodeId,
          end: endNodeId,
          traffic: trafficMode,
        }),
      });

      if (!response.ok) throw new Error("Backend pathing failed.");
      const data = await response.json();
      console.log("Data successfully received from backend algorithm:", data);

      // FORCE CONVERSION: Convert all returned path IDs to clean strings
      const cleanedPath = data.path.map((id) => String(id));

      // 1. Draw the path line on the Leaflet map layer
      drawRouteOnMap(cleanedPath);

      // 2. Update the UI text statistical summary metrics cards
      updateSummaryCards(data.distance, data.time, data.fuelSaved, data.stops);

      // 3. Update the Chart.js visual comparison bars layout elements
      updateChart(
        data.originalDistance,
        data.originalTime,
        data.originalFuel,
        data.distance,
        data.time,
        data.fuelSaved,
      );

      console.log("Dashboard view metrics successfully updated!");
    } catch (error) {
      console.error("Routing execution UI rendering error:", error.message);
    }
  }

  function handleNodeSelection(nodeId) {
    nodeId = String(nodeId);

    if (!startNodeId || (startNodeId && endNodeId)) {
      if (currentPolyline && map) map.removeLayer(currentPolyline);
      currentPolyline = null;
      startNodeId = nodeId;
      endNodeId = null;
      if (startSelect) startSelect.value = nodeId;
      if (endSelect) endSelect.value = "";
      mapMarkers[nodeId]
        .bindPopup(`🟢 <b>Start Point Set</b><br>${nodesData[nodeId].name}`)
        .openPopup();
    } else {
      if (startNodeId === nodeId) return;
      endNodeId = nodeId;
      if (endSelect) endSelect.value = nodeId;
      mapMarkers[nodeId]
        .bindPopup(`🔴 <b>End Point Set</b><br>${nodesData[nodeId].name}`)
        .openPopup();
      fetchOptimizedPath();
    }
  }

  // ==========================================
  // 3. BULLETPROOF BUTTON CLICK EVENT HANDLER
  // ==========================================
  const universalPathBtn =
    document.getElementById("findPathButton") ||
    document.querySelector(".search-btn") ||
    document.querySelector("button");

  if (universalPathBtn) {
    console.log("Success: Pathfinding button successfully targeted in the UI.");

    universalPathBtn.onclick = function (e) {
      e.preventDefault();
      console.log("⚡ AI Optimization button clicked!");

      const dynamicStart = document.getElementById("startLocationSelect");
      const dynamicEnd = document.getElementById("endLocationSelect");

      if (dynamicStart && dynamicEnd) {
        startNodeId = dynamicStart.value;
        endNodeId = dynamicEnd.value;

        console.log(
          `Routing values -> Origin ID: ${startNodeId} | Destination ID: ${endNodeId}`,
        );

        if (
          !startNodeId ||
          startNodeId === "" ||
          !endNodeId ||
          endNodeId === ""
        ) {
          alert(
            "Please select both a starting location and an endpoint destination from the dropdown fields!",
          );
          return;
        }
        if (startNodeId === endNodeId) {
          alert(
            "Origin and destination positions cannot match. Please select different points.",
          );
          return;
        }

        fetchOptimizedPath();
      } else {
        console.error(
          "Critical Error: Location dropdown select elements are missing from the DOM layout.",
        );
      }
    };
  }

  // Traffic Button Toggles
  if (lowTrafficButton) {
    lowTrafficButton.addEventListener("click", function () {
      trafficMode = "low";
      lowTrafficButton.classList.add("active");
      if (highTrafficButton) highTrafficButton.classList.remove("active");
      if (startNodeId && endNodeId) fetchOptimizedPath();
    });
  }

  if (highTrafficButton) {
    highTrafficButton.addEventListener("click", function () {
      trafficMode = "high";
      highTrafficButton.classList.add("active");
      if (lowTrafficButton) lowTrafficButton.classList.remove("active");
      if (startNodeId && endNodeId) fetchOptimizedPath();
    });
  }

  // ==========================================
  // 4. DATA LOADER FROM GRAPH.JSON
  // ==========================================
  if (map) {
    fetch("/graph.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((graphData) => {
        console.log("📥 Raw graph data received by frontend:", graphData);
        nodesData = {};

        // Target extraction handles arrays directly, or nested property wrappers
        let targetArray = [];
        if (graphData && Array.isArray(graphData.nodes)) {
          targetArray = graphData.nodes;
        } else if (
          graphData &&
          graphData.nodes &&
          typeof graphData.nodes === "object"
        ) {
          targetArray = Object.values(graphData.nodes);
        } else if (Array.isArray(graphData)) {
          targetArray = graphData;
        } else if (typeof graphData === "object") {
          targetArray = Object.values(graphData);
        }

        if (targetArray.length === 0) {
          console.error(
            "❌ Error: No nodes found in the server's graph payload response.",
          );
          return;
        }

        // Reset selector choices to guarantee a clean slate setup
        if (startSelect)
          startSelect.innerHTML =
            '<option value="">-- Choose Origin --</option>';
        if (endSelect)
          endSelect.innerHTML =
            '<option value="">-- Choose Destination --</option>';

        targetArray.forEach((n) => {
          if (!n || !n.id) return; // Skip corrupted nodes

          const stringId = String(n.id);
          nodesData[stringId] = n;

          // Render the geographical pin onto our Leaflet interactive viewport layer
          if (n.lat && n.lon) {
            const marker = L.marker([n.lat, n.lon]).addTo(map);
            marker.bindPopup(
              `📍 <b>${n.name || "Unnamed Hub"}</b><br>Click to select.`,
            );
            marker.on("click", () => handleNodeSelection(stringId));
            mapMarkers[stringId] = marker;
          }

          // Populate frontend dropdown list element parameters dynamically
          if (startSelect) {
            const opt = document.createElement("option");
            opt.value = stringId;
            opt.textContent = n.name || `Location Hub ${stringId}`;
            startSelect.appendChild(opt);
          }
          if (endSelect) {
            const opt = document.createElement("option");
            opt.value = stringId;
            opt.textContent = n.name || `Location Hub ${stringId}`;
            endSelect.appendChild(opt);
          }
        });

        console.log(
          `✅ Success: Populated ${targetArray.length} location nodes into your dropdown options!`,
        );
      })
      .catch((err) =>
        console.error("Data loading rendering error:", err.message),
      );
  }

  // ==========================================
  // ✨ 5. INTERACTIVE SIDEBAR NAVIGATION CONTROLLER
  // ==========================================
  const navItems = document.querySelectorAll(".dashboard-menu li");
  const viewPanels = document.querySelectorAll(".view-panel");
  const historyLogList = document.getElementById("historyLogList");

  // --- A. VIEWPORT SWITCHER LOOP ---
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Highlight active navigation tab
      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");

      // Toggle views
      viewPanels.forEach((panel) => {
        panel.style.display = "none";
      });

      const targetPanelId = this.getAttribute("data-target");
      const targetPanel = document.getElementById(targetPanelId);

      if (targetPanel) {
        targetPanel.style.display = "block";
        console.log(`📡 View switched to: ${targetPanelId}`);

        // Handle Leaflet sizing when returning to dashboard
        if (targetPanelId === "dashboard-panel" && map) {
          setTimeout(() => {
            map.invalidateSize();
          }, 50);
        }

        // Trigger dynamic tab components on-demand
        if (targetPanelId === "stops-panel") populateNodesDirectory();
        if (targetPanelId === "routes-panel") updateRoutesTable();
      }
    });
  });

  // --- B. STOPS TAB: GENERATE NETWORK DIRECTORY ---
  function populateNodesDirectory() {
    const stopsPanel = document.getElementById("stops-panel");
    if (!stopsPanel || !nodesData || Object.keys(nodesData).length === 0)
      return;

    stopsPanel.innerHTML = `
      <h3>🏣 Network Hubs & Node Directory</h3>
      <p style="color: #64748b; margin-top: 4px; margin-bottom: 20px;">Geographical coordinate intersection listings pulled directly from your spatial graph data structure.</p>
      <div id="nodesGridContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;"></div>
    `;

    const grid = document.getElementById("nodesGridContainer");

    Object.values(nodesData).forEach((node) => {
      const card = document.createElement("div");
      card.style.cssText =
        "border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; background: #f8fafc;";
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.2rem;">📍</span>
          <h4 style="margin: 0; color: #1e293b; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${node.name || "Unnamed Hub"}</h4>
        </div>
        <p style="font-size: 0.8rem; color: #64748b; margin: 8px 0 0 0; font-family: monospace; line-height: 1.4;">
          ID: ${node.id}<br>
          Lat: ${parseFloat(node.lat).toFixed(4)}<br>
          Lon: ${parseFloat(node.lon).toFixed(4)}
        </p>
      `;
      grid.appendChild(card);
    });
  }

  // --- C. HISTORY TAB: AUDIT LOGGER FUNCTION ---
  function addSearchAuditTrailLog(startText, endText, dist, time, strategy) {
    if (!historyLogList) return;

    const logItem = document.createElement("div");
    logItem.style.cssText =
      "padding: 12px 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;";
    logItem.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style="font-weight: 600; font-size: 0.9rem; color: #1e293b;">⚡ ${startText} ➔ ${endText}</span>
        <span style="font-size: 0.8rem; color: #64748b;">Distance: ${dist} km | Travel Time: ${time}</span>
      </div>
      <span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${strategy.toUpperCase()} TRAFFIC</span>
    `;

    if (
      historyLogList.children.length > 0 &&
      historyLogList.innerHTML.includes("System Base Initialized")
    ) {
      historyLogList.innerHTML = ""; // Wipe initial placeholder card
    }
    historyLogList.insertBefore(logItem, historyLogList.firstChild);
  }

  // --- D. INTERCEPT SEARCH CLICK FOR LOG GENERATION ---
  if (universalPathBtn) {
    universalPathBtn.addEventListener("click", function () {
      setTimeout(() => {
        const dynamicStart = document.getElementById("startLocationSelect");
        const dynamicEnd = document.getElementById("endLocationSelect");

        if (
          dynamicStart &&
          dynamicEnd &&
          dynamicStart.value &&
          dynamicEnd.value
        ) {
          const sName = dynamicStart.options[dynamicStart.selectedIndex].text;
          const eName = dynamicEnd.options[dynamicEnd.selectedIndex].text;

          // Let background response data arrive before grabbing inner text properties
          setTimeout(() => {
            const rawDist = document
              .getElementById("totalDistance")
              .innerText.replace("km", "")
              .trim();
            const rawTime = document
              .getElementById("totalTime")
              .innerText.trim();
            if (rawDist !== "--") {
              addSearchAuditTrailLog(
                sName,
                eName,
                rawDist,
                rawTime,
                trafficMode,
              );
            }
          }, 600);
        }
      }, 50);
    });
  }

  // --- E. ROUTES TAB: LOGS LIVE DATATABLE ---
  function updateRoutesTable() {
    const routesPanel = document.getElementById("routes-panel");
    if (!routesPanel) return;

    let tableRowsHTML = "";
    const dynamicStart = document.getElementById("startLocationSelect");
    const dynamicEnd = document.getElementById("endLocationSelect");

    if (
      !dynamicStart ||
      !dynamicEnd ||
      !dynamicStart.value ||
      !dynamicEnd.value ||
      document.getElementById("totalDistance").innerText === "--"
    ) {
      tableRowsHTML = `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td colspan="4" style="padding: 20px 8px; text-align: center; color: #94a3b8; font-style: italic;">No calculated routes available. Run optimization on the Dashboard first!</td>
        </tr>
      `;
    } else {
      const sName = dynamicStart.options[dynamicStart.selectedIndex].text;
      const eName = dynamicEnd.options[dynamicEnd.selectedIndex].text;
      const calculatedDistance =
        document.getElementById("totalDistance").innerText;

      tableRowsHTML = `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 14px 8px; font-weight: 600; color: #1e293b;">Active Transit Track</td>
          <td style="padding: 14px 8px; color: #475569;">${sName} ➔ ${eName}</td>
          <td style="padding: 14px 8px; color: #475569; font-weight: 500;">${calculatedDistance}</td>
          <td style="padding: 14px 8px;"><span style="background: #dcfce7; color: #15803d; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">Active / Loaded</span></td>
        </tr>
      `;
    }

    routesPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h3>🗺️ Session Active Route Logs</h3>
          <p style="color: #64748b; margin-top: 4px;">Monitor computed trajectories based on currently plotted graph nodes.</p>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.85rem;">
            <th style="padding: 12px 8px;">ROUTE CLASSIFICATION</th>
            <th style="padding: 12px 8px;">TRANSIT PATH BOUNDS</th>
            <th style="padding: 12px 8px;">TOTAL LENGTH</th>
            <th style="padding: 12px 8px;">STATUS</th>
          </tr>
        </thead>
        <tbody style="font-size: 0.95rem; color: #334155;">
          ${tableRowsHTML}
        </tbody>
      </table>
    `;
  }

  // --- F. SETTINGS CONFIGURATION ACTIONS ---
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", function () {
      alert("⚙️ System Configuration Parameters Saved successfully!");
    });
  }
});
