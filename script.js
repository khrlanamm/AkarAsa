// Data for articles, moved from Python backend to JavaScript
const articles_data = [
  {
    title: "Memahami Fitoremediasi",
    description:
      "Pelajari dasar-dasar ilmiah bagaimana tanaman, seperti Alyssum, dapat membersihkan tanah dari polutan logam berat.",
    image_url:
      "https://placehold.co/600x400/A5D6A7/388E3C?text=Phytoremediation",
    link_url: "https://en.wikipedia.org/wiki/Phytoremediation",
  },
  {
    title: "Regulasi Lingkungan di Indonesia",
    description:
      "Lihat lebih dalam mengenai Peraturan Pemerintah No. 22 Tahun 2021 yang menjadi dasar ambang batas aman.",
    image_url: "https://placehold.co/600x400/C5CAE9/3F51B5?text=Regulation",
    link_url:
      "https://peraturan.bpk.go.id/Home/Details/163700/pp-no-22-tahun-2021",
  },
  {
    title: "Studi Kasus: Tambang Nikel",
    description:
      "Tantangan ekologis dan upaya reklamasi yang telah dilakukan pada lahan-lahan bekas tambang nikel di seluruh dunia.",
    image_url: "https://placehold.co/600x400/BCAAA4/795548?text=Nickel+Mine",
    link_url: "https://www.mongabay.co.id/tag/tambang-nikel/",
  },
];

// --- Core Scientific Model and Solver ---

// Model parameters (same as in the Python script)
const params = {
  r: 2.0,
  K: 8000,
  c: 0.8,
  b_tox: 7500,
  u: 1 / 50000,
  delta: 0,
  l: 0.03,
};
const N_AMAN = 75.0; // Safe Nickel level threshold

/**
 * The remediation model function, ported from Python to JavaScript.
 * @param {number} t - current time (not used in this model but required by solver).
 * @param {Array<number>} y - array of current values [A, N].
 * @returns {Array<number>} - array of the derivatives [dAdt, dNdt].
 */
function remediation_model(t, y) {
  const [A, N] = y;
  const { r, K, c, b_tox, u, delta, l } = params;
  const dAdt = r * A * (1 - A / K) - (c * N * A) / (b_tox + N);
  const dNdt = -u * A * N + delta * A - l * N;
  return [dAdt, dNdt];
}

/**
 * A simple Runge-Kutta 4th order (RK4) ODE solver.
 * This replaces scipy.solve_ivp from the Python backend.
 * @param {Function} model - The function defining the ODE system.
 * @param {Array<number>} y0 - Initial conditions [A0, N0].
 * @param {Array<number>} t_span - The time interval [t_start, t_end].
 * @param {number} dt - The time step size.
 * @returns {Object} - An object containing arrays for time, A, and N values.
 */
function solve_ivp_rk4(model, y0, t_span, dt) {
  const t_values = [];
  const A_values = [];
  const N_values = [];

  let t = t_span[0];
  let y = [...y0];

  while (t <= t_span[1]) {
    t_values.push(t);
    A_values.push(y[0]);
    N_values.push(y[1]);

    // RK4 calculation steps
    const k1 = model(t, y);
    const k2 = model(t + 0.5 * dt, [
      y[0] + 0.5 * dt * k1[0],
      y[1] + 0.5 * dt * k1[1],
    ]);
    const k3 = model(t + 0.5 * dt, [
      y[0] + 0.5 * dt * k2[0],
      y[1] + 0.5 * dt * k2[1],
    ]);
    const k4 = model(t + dt, [y[0] + dt * k3[0], y[1] + dt * k3[1]]);

    y[0] += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y[1] += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    t += dt;
  }

  return { t: t_values, A: A_values, N: N_values };
}

// --- Chart and UI Management ---
let tsChart, phaseChart; // Variables to hold chart instances

/**
 * Creates or updates the time series plot.
 * @param {Object} sol - The solution object from the solver.
 */
function createTimeSeriesPlot(sol) {
  const ctx = document.getElementById("ts-plot-canvas").getContext("2d");
  if (tsChart) {
    tsChart.destroy(); // Destroy previous chart instance if it exists
  }
  tsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: sol.t,
      datasets: [
        {
          label: "Kadar Nikel (N)",
          data: sol.N,
          borderColor: "#8C564B",
          backgroundColor: "rgba(140, 86, 75, 0.2)",
          yAxisID: "y-nickel",
          tension: 0.1,
          pointRadius: 0,
        },
        {
          label: "Biomassa Alyssum (A)",
          data: sol.A,
          borderColor: "#2CA02C",
          backgroundColor: "rgba(44, 160, 44, 0.2)",
          yAxisID: "y-biomass",
          borderDash: [5, 5],
          tension: 0.1,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: "Waktu (tahun)" },
        },
        "y-nickel": {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Kadar Nikel (mg/kg)",
            color: "#8C564B",
          },
          ticks: { color: "#8C564B" },
          beginAtZero: true,
        },
        "y-biomass": {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "Biomassa Alyssum (kg/ha)",
            color: "#2CA02C",
          },
          ticks: { color: "#2CA02C" },
          grid: { drawOnChartArea: false }, // only draw grid for one axis
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: { mode: "index", intersect: false },
      },
    },
  });
}

/**
 * Creates or updates the phase portrait plot.
 * @param {Object} sol - The solution object from the solver.
 */
function createPhasePlot(sol) {
  const ctx = document.getElementById("phase-plot-canvas").getContext("2d");
  if (phaseChart) {
    phaseChart.destroy(); // Destroy previous chart instance
  }
  const trajectoryData = sol.A.map((val, index) => ({
    x: val,
    y: sol.N[index],
  }));

  phaseChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Lintasan Sistem",
          data: trajectoryData,
          borderColor: "#D62728",
          backgroundColor: "rgba(214, 39, 40, 0.5)",
          showLine: true,
          tension: 0.1,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: { display: true, text: "Biomassa Alyssum (A) (kg/ha)" },
          beginAtZero: true,
        },
        y: {
          title: { display: true, text: "Kadar Nikel (N) (mg/kg)" },
          beginAtZero: true,
        },
      },
    },
  });
}

/**
 * Dynamically creates and injects article cards into the DOM.
 */
function populateArticles() {
  const container = document.getElementById("articles-grid-container");
  let articlesHTML = "";
  articles_data.forEach((article) => {
    articlesHTML += `
            <div class="article-card">
                <a href="${article.link_url}" target="_blank" rel="noopener noreferrer">
                    <img src="${article.image_url}" alt="${article.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found';">
                    <div class="card-content">
                        <h3>${article.title}</h3>
                        <p>${article.description}</p>
                    </div>
                </a>
            </div>
        `;
  });
  container.innerHTML = articlesHTML;
}

// --- Main Event Listener ---

// Run when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  populateArticles(); // Load articles on page start

  const form = document.getElementById("simulation-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const resultsSection = document.getElementById("results-section");
    const loader = document.getElementById("loader");
    const interpretationText = document.getElementById("interpretation-text");
    const submitBtn = document.getElementById("submit-btn");

    // 1. Setup UI for loading state
    resultsSection.classList.remove("hidden");
    loader.classList.remove("hidden");
    interpretationText.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Menjalankan Simulasi...";

    // Hide old plots if they exist
    const tsCanvas = document.getElementById("ts-plot-canvas");
    const phaseCanvas = document.getElementById("phase-plot-canvas");
    tsCanvas.style.display = "none";
    phaseCanvas.style.display = "none";

    // Using setTimeout to ensure the UI updates before the heavy computation starts
    setTimeout(() => {
      try {
        // 2. Get input values
        const initialA = parseFloat(document.getElementById("initial_A").value);
        const initialN = parseFloat(document.getElementById("initial_N").value);
        const y0 = [initialA, initialN];
        const t_span = [0, 150];
        const dt = 0.1; // Time step for the solver

        // 3. Run the simulation
        const solution = solve_ivp_rk4(remediation_model, y0, t_span, dt);

        // 4. Analyze results
        let time_to_safe = -1;
        for (let i = 0; i < solution.N.length; i++) {
          if (solution.N[i] <= N_AMAN) {
            time_to_safe = solution.t[i];
            break;
          }
        }

        let interpretation;
        if (time_to_safe !== -1) {
          interpretation = `Berdasarkan simulasi, kadar nikel di lahan diprediksi akan mencapai ambang batas aman (${N_AMAN} mg/kg) setelah sekitar ${time_to_safe.toFixed(
            2
          )} tahun.`;
        } else {
          interpretation = `Dengan kondisi ini, kadar nikel tidak mencapai batas aman (${N_AMAN} mg/kg) dalam ${t_span[1]} tahun. Diperlukan waktu lebih lama atau intervensi tambahan.`;
        }
        interpretationText.textContent = interpretation;

        // 5. Create plots
        tsCanvas.style.display = "block";
        phaseCanvas.style.display = "block";
        createTimeSeriesPlot(solution);
        createPhasePlot(solution);
      } catch (error) {
        interpretationText.textContent =
          "Terjadi kesalahan saat simulasi: " + error.message;
        console.error("Simulation Error:", error);
      } finally {
        // 6. Finalize UI
        loader.classList.add("hidden");
        submitBtn.disabled = false;
        submitBtn.textContent = "Simulasikan Pemulihan";
      }
    }, 50); // A small delay
  });
});
