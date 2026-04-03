function calculateOptimalCombination(expNeeded) {
	const values = { XL: 30000, L: 10000, M: 3000, S: 800, XS: 100 };
	const result = { XL: 0, L: 0, M: 0, S: 0, XS: 0 };
	let remaining = expNeeded;

	for (const [candy, exp] of Object.entries(values)) {
		if (candy === "XS") {
			result.XS = Math.ceil(remaining / exp);
			break;
		}

		result[candy] = Math.floor(remaining / exp);
		remaining -= result[candy] * exp;
	}

	return result;
}

function normalizeExpRate(expRate) {
	return String(expRate || "").replace(/\s+/g, "");
}

function expForLevel(normalizedRate, level) {
	if (!Number.isFinite(level) || level < 1) {
		return 0;
	}

	if (normalizedRate === "Erratic") {
		if (level <= 50) {
			return ((level ** 3) * (100 - level)) / 50;
		}
		if (level <= 68) {
			return ((level ** 3) * (150 - level)) / 100;
		}
		if (level <= 98) {
			return ((level ** 3) * Math.floor((1911 - level * 10) / 3)) / 500;
		}
		return ((level ** 3) * (160 - level)) / 100;
	}

	if (normalizedRate === "Fast") {
		return (4 * (level ** 3)) / 5;
	}

	if (normalizedRate === "MediumFast") {
		return level ** 3;
	}

	if (normalizedRate === "MediumSlow") {
		return (6 / 5) * (level ** 3) - 15 * (level ** 2) + 100 * level - 140;
	}

	if (normalizedRate === "Slow") {
		return (5 * (level ** 3)) / 4;
	}

	if (normalizedRate === "Fluctuating") {
		if (level <= 15) {
			return (level ** 3) * ((Math.floor((level + 1) / 3) + 24) / 50);
		}
		if (level <= 36) {
			return (level ** 3) * ((level + 14) / 50);
		}
		return (level ** 3) * ((Math.floor(level / 2) + 32) / 50);
	}

	return 0;
}

function getCurrentLevel(expRate, currExp) {
	const normalizedRate = normalizeExpRate(expRate);
	const currentExp = Number(currExp) || 0;

	for (let level = 100; level >= 1; level -= 1) {
		if (currentExp >= expForLevel(normalizedRate, level)) {
			return level;
		}
	}

	return 1;
}

function updateCurrentLevelDisplay() {
	const expRate = document.getElementById("expRate").value;
	const currExp = document.getElementById("currExp").value;
	const currentLevel = getCurrentLevel(expRate, currExp);
	document.getElementById("currentLevel").value = currentLevel;
}

function calculate(expRate, currExp, desiredLevel) {
	const normalizedRate = normalizeExpRate(expRate);
	const currentExp = Number(currExp) || 0;
	const level = Number(desiredLevel);
	let expNeeded = expForLevel(normalizedRate, level);

	expNeeded = Math.max(0, expNeeded - currentExp);

	document.getElementById("XS").innerText = Math.ceil(expNeeded / 100);
	document.getElementById("S").innerText = Math.ceil(expNeeded / 800);
	document.getElementById("M").innerText = Math.ceil(expNeeded / 3000);
	document.getElementById("L").innerText = Math.ceil(expNeeded / 10000);
	document.getElementById("XL").innerText = Math.ceil(expNeeded / 30000);

	// Calculate optimal usage
	const optimal = calculateOptimalCombination(expNeeded);
	document.getElementById("XL-opt").innerText = optimal.XL;
	document.getElementById("L-opt").innerText = optimal.L;
	document.getElementById("M-opt").innerText = optimal.M;
	document.getElementById("S-opt").innerText = optimal.S;
	document.getElementById("XS-opt").innerText = optimal.XS;
}

async function loadPokemonOptions() {
	const select = document.getElementById("expRate");

	try {
		const response = await fetch("data.json");
		if (!response.ok) {
			throw new Error("Could not load data.json");
		}

		const data = await response.json();
		const names = Object.keys(data);

		select.innerHTML = "";

		for (const name of names) {
			const option = document.createElement("option");
			option.value = data[name];
			option.textContent = name;
			select.appendChild(option);
		}
	} catch (error) {
		select.innerHTML = '<option value="">Failed to load Pokemon list</option>';
		console.error(error);
	}
}

document.addEventListener("DOMContentLoaded", async function () {
	await loadPokemonOptions();
	updateCurrentLevelDisplay();

	document.getElementById("expRate").addEventListener("change", updateCurrentLevelDisplay);
	document.getElementById("currExp").addEventListener("input", updateCurrentLevelDisplay);

	const form = document.getElementById("calculatorForm");
	form.addEventListener("submit", function (event) {
		event.preventDefault();

		calculate(
			document.getElementById("expRate").value,
			document.getElementById("currExp").value,
			document.getElementById("desiredLevel").value
		);
	});
});
