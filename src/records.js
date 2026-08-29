const state = {
  records: [],
  query: "",
  category: "all",
  status: "all",
  sort: "date-desc",
  loading: true,
  error: null,
};

const sorters = {
  "date-desc": (a, b) => b.date.localeCompare(a.date),
  "date-asc": (a, b) => a.date.localeCompare(b.date),
  "amount-desc": (a, b) => b.cost - a.cost,
  "amount-asc": (a, b) => a.cost - b.cost,
};

function debounce(fn, delay = 300) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), delay);
  };
}

function visibleRecords() {
  const q = state.query.trim().toLowerCase();
  return state.records
    .filter((r) => state.category === "all" || r.region === state.category)
    .filter((r) => state.status === "all" || r.status === state.status)
    .filter((r) => !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    .sort(sorters[state.sort]);
}

const statusColors = {
  "running": "bg-success/20 text-success border border-success/30",
  "provisioning": "bg-warning/20 text-warning border border-warning/30",
  "stopped": "bg-danger/20 text-danger border border-danger/30"
};

const statusLabels = {
  "running": "Running",
  "provisioning": "Provisioning",
  "stopped": "Stopped"
};

const container = document.getElementById("data-container");
const tbody = document.getElementById("table-body");
const rowTemplate = document.getElementById("row-template");
const errorMsg = document.getElementById("error-message");

function render() {
  if (state.loading) {
    container.dataset.state = "loading";
    return;
  }

  if (state.error) {
    container.dataset.state = "error";
    errorMsg.textContent = state.error;
    return;
  }

  const displayData = visibleRecords();

  if (displayData.length === 0) {
    container.dataset.state = "empty";
    return;
  }

  container.dataset.state = "data";

  const rows = displayData.map(record => {
    const clone = rowTemplate.content.firstElementChild.cloneNode(true);

    clone.querySelector("[data-cell='id']").textContent = record.id;
    clone.querySelector("[data-cell='name']").textContent = record.name;
    clone.querySelector("[data-cell='region']").textContent = record.region;

    const statusEl = clone.querySelector("[data-cell='status']");
    statusEl.textContent = statusLabels[record.status] || record.status;
    statusEl.className = `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[record.status] || "bg-slate-700 text-white"}`;

    clone.querySelector("[data-cell='ram']").textContent = record.ram + " GB";
    clone.querySelector("[data-cell='cost']").textContent = "$ " + record.cost.toFixed(2);
    clone.querySelector("[data-cell='date']").textContent = record.date;

    // Delete action
    const delBtn = clone.querySelector(".btn-delete");
    delBtn.addEventListener("click", () => {
      if (confirm(`Terminate instance ${record.name}?`)) {
        state.records = state.records.filter(r => r.id !== record.id);
        saveRecords();
        render();
      }
    });

    return clone;
  });

  tbody.replaceChildren(...rows);
}

async function loadRecords(forceRestore = false) {
  if (!forceRestore) {
    const cached = localStorage.getItem("cf-records-server");
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const res = await fetch("./data/records.json");
  if (!res.ok) throw new Error(`Máy chủ trả về ${res.status}`);
  const data = await res.json();
  localStorage.setItem("cf-records-server", JSON.stringify(data));
  return data;
}

function saveRecords() {
  localStorage.setItem("cf-records-server", JSON.stringify(state.records));
}

// Bind events
document.getElementById("search-input").addEventListener("input", debounce((e) => {
  state.query = e.target.value;
  render();
}));

document.getElementById("filter-category").addEventListener("change", (e) => {
  state.category = e.target.value;
  render();
});

document.getElementById("filter-status").addEventListener("change", (e) => {
  state.status = e.target.value;
  render();
});

document.getElementById("sort-select").addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});

document.getElementById("btn-restore").addEventListener("click", async () => {
  if (confirm("Restore default sample data?")) {
    state.loading = true;
    state.error = null;
    render();
    try {
      state.records = await loadRecords(true);
    } catch (err) {
      state.error = `Không tải được dữ liệu: ${err.message}`;
    } finally {
      state.loading = false;
      render();
    }
  }
});

// Modal logic for Launch Instance
const modalLaunch = document.getElementById("modal-launch");
const formLaunch = document.getElementById("form-launch");
const btnCancelLaunch = document.getElementById("btn-cancel-launch");
const instanceRegion = document.getElementById("instance-region");
const instanceRam = document.getElementById("instance-ram");
const estimatedCostEl = document.getElementById("estimated-cost");

const regionPrices = {
  "us-east-1": 0,
  "us-west-1": 5,
  "eu-west-2": 10,
  "eu-central-1": 10,
  "ap-south-1": 15,
  "ap-southeast-1": 15
};

function updateEstimatedCost() {
  const baseCost = 20;
  const regionCost = regionPrices[instanceRegion.value] || 0;
  const ramCost = parseInt(instanceRam.value) * 5;
  const totalCost = baseCost + regionCost + ramCost;
  estimatedCostEl.textContent = totalCost.toFixed(2);
}

instanceRegion.addEventListener("change", updateEstimatedCost);
instanceRam.addEventListener("change", updateEstimatedCost);

document.getElementById("btn-add").addEventListener("click", () => {
  modalLaunch.classList.remove("hidden");
  updateEstimatedCost();
  document.getElementById("instance-name").focus();
});

btnCancelLaunch.addEventListener("click", () => {
  modalLaunch.classList.add("hidden");
  formLaunch.reset();
});

formLaunch.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("instance-name").value.trim();
  const status = document.getElementById("instance-status").value;
  const region = instanceRegion.value;
  const ram = parseInt(instanceRam.value);

  const regionCost = regionPrices[region] || 0;
  const totalCost = 20 + regionCost + (ram * 5);

  const newRecord = {
    id: `i-` + Math.random().toString(36).substring(2, 10),
    name: name || "new-instance-" + Math.floor(Math.random() * 100),
    region: region,
    status: status,
    ram: ram,
    cost: totalCost,
    date: new Date().toISOString().split('T')[0]
  };

  state.records.unshift(newRecord);
  saveRecords();
  render();

  modalLaunch.classList.add("hidden");
  formLaunch.reset();
});

// Init
async function init() {
  render(); // render loading state
  try {
    state.records = await loadRecords();
  } catch (err) {
    state.error = `Không tải được dữ liệu: ${err.message}`;
  } finally {
    state.loading = false;
    render();
  }
}

// Theme toggle logic
document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const isLight = document.documentElement.classList.toggle("light");
    try {
      localStorage.setItem("cf-theme", isLight ? "light" : "dark");
    } catch (e) { }
    document.documentElement.classList.add("theme-anim");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-anim");
    }, 400);
  });
});

// Mobile menu logic
const menuButton = document.querySelector("#menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuButton && mobileMenu) {
  const isMenuOpen = () => !mobileMenu.classList.contains("hidden");

  const closeMobileMenu = () => {
    mobileMenu.classList.add("hidden");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const open = isMenuOpen();
    mobileMenu.classList.toggle("hidden", open);
    menuButton.setAttribute("aria-expanded", String(!open));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      closeMobileMenu();
    }
  });
}

init();
