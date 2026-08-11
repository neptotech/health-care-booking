const panelColors = ["#d4270a", "#e8b800", "#1f4fd8", "#16a34a", "#b91c1c", "#0d1b3e", "#c0392b", "#f59e0b", "#2563eb", "#0f766e", "#7c3aed", "#1e3a8a"];
const grid = document.getElementById("bgPanels");
for (let i = 0; i < 96; i++) {
	const div = document.createElement("div");
	div.className = "bg-panel";
	div.style.background = panelColors[i % panelColors.length];
	div.style.animationDelay = `${i*.07%6}s`;
	div.style.animationDuration = `${4+i%5}s`;
	grid.appendChild(div)
}
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin";
const SESSION_KEY = "hcrs_session";
if (sessionStorage.getItem(SESSION_KEY) === "authenticated") {
	window.location.replace("booking.html")
}
const form = document.getElementById("loginForm");
const signinBtn = document.getElementById("signinBtn");
const errorMsg = document.getElementById("errorMsg");
const errorText = document.getElementById("errorText");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");

function showError(msg) {
	errorText.textContent = msg;
	errorMsg.classList.add("visible");
	usernameInput.classList.add("error");
	passwordInput.classList.add("error")
}

function clearError() {
	errorMsg.classList.remove("visible");
	usernameInput.classList.remove("error");
	passwordInput.classList.remove("error")
}
usernameInput.addEventListener("input", clearError);
passwordInput.addEventListener("input", clearError);
form.addEventListener("submit", e => {
	e.preventDefault();
	clearError();
	const username = usernameInput.value.trim();
	const password = passwordInput.value;
	if (!username || !password) {
		showError("Please enter both username and password.");
		return
	}
	signinBtn.classList.add("loading");
	signinBtn.disabled = true;
	setTimeout(() => {
		if (username === VALID_USERNAME && password === VALID_PASSWORD) {
			sessionStorage.setItem(SESSION_KEY, "authenticated");
			window.location.replace("booking.html")
		} else {
			signinBtn.classList.remove("loading");
			signinBtn.disabled = false;
			showError("Invalid username or password. Please try again.");
			passwordInput.value = "";
			passwordInput.focus()
		}
	}, 700)
});
