const doctors = [{
	name: "Dr. Deepa Shah",
	role: "Medical Consultant",
	photo: "photos/Deepa.jpg",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 13.30 to 16.30 hrs"
	}]
}, {
	name: "Dr. Bhavesh Panchal",
	role: "Medical Consultant",
	photo: "photos/Bhavesh.jpg",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 16.30 to 18.30 hrs"
	}, {
		days: ["sat"],
		label: "Sat: 11.00 to 13.00 hrs"
	}]
}, {
	name: "Dr. Vinita Bhoja Shetty",
	role: "Medical Officer",
	photo: "photos/Vinita.png",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 09:00 to 18:00 hrs"
	}]
}, {
	name: "Dr. Navdeep Tiwari",
	role: "Resident Medical Doctor",
	photo: "photos/Navdeep.png",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 17:00 to 21:00 hrs"
	}, {
		days: ["sun"],
		label: "Sun: 10:00 to 13:00 hrs"
	}]
}, {
	name: "Dr. Aakriti Jha",
	role: "Consultant Psychiatrist",
	photo: "photos/Aakriti Jha.png",
	schedule: [{
		days: ["fri"],
		label: "Fri: 13:00 to 15:00 hrs"
	}]
}, {
	name: "Dr. Jainisha Patel",
	role: "Gynecologist",
	photo: "photos/jainisha.png",
	schedule: [{
		days: ["wed", "fri"],
		label: "Wed & Fri: 15:00 to 16:30 hrs"
	}]
}, {
	name: "Dr. Maulik Kapadia",
	role: "Pediatrician",
	photo: "photos/maulik.png",
	schedule: [{
		days: ["tue", "thu"],
		label: "Tue & Thu: 15:00 to 16:30 hrs"
	}]
}, {
	name: "Dr. Darshan Patel",
	role: "Visiting Physiotherapy Consultant",
	photo: "photos/Darshan Patel - Visiting Physiotherapy Consultant.jpg",
	schedule: [{
		days: ["wed"],
		label: "Wed: 16:00 to 18:00 hrs"
	}]
}, {
	name: "Dr. Himani Patel",
	role: "Visiting Physiotherapy Consultant",
	photo: "photos/Himani Patel - Visiting Physiotherapy Consultant.jpg",
	schedule: [{
		days: ["tue", "wed", "thu", "fri", "sat"],
		label: "Tue to Sat: 10:00 to 13:00 hrs"
	}]
}];
const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const bannerImages = ["./banner/b1.jpg", "./banner/b2.jpg"].sort((left, right) => left.localeCompare(right));
const heroSwiperElement = document.getElementById("heroSwiper");
const heroSwiperWrapper = document.getElementById("heroSwiperWrapper");
const openHeroImage = document.getElementById("openHeroImage");
const prevBanner = document.getElementById("prevBanner");
const nextBanner = document.getElementById("nextBanner");
const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const openMapLink = document.getElementById("openMapLink");
const mapModal = document.getElementById("mapModal");
const closeMapModal = document.getElementById("closeMapModal");
const heroImageModal = document.getElementById("heroImageModal");
const heroImagePreview = document.getElementById("heroImagePreview");
const closeHeroImage = document.getElementById("closeHeroImage");
const dateInput = document.getElementById("dateInput");
const chosenDateText = document.getElementById("chosenDateText");
const openDatePicker = document.getElementById("openDatePicker");
const doctorCards = document.getElementById("doctorCards");
heroSwiperWrapper.innerHTML = bannerImages.map(imagePath => `\n            <div class="swiper-slide" style="background-image: linear-gradient(rgba(0,0,0,0.16), rgba(0,0,0,0.16)), url('${imagePath}')"></div>\n        `).join("");
const heroSwiper = new Swiper(heroSwiperElement, {
	loop: true,
	speed: 420,
	slidesPerView: 1,
	grabCursor: true,
	allowTouchMove: true,
	navigation: {
		nextEl: "#nextBanner",
		prevEl: "#prevBanner"
	}
});

function updateBannerImage(index) {
	heroSwiper.slideToLoop(index % bannerImages.length, 0)
}

function getCurrentBannerImage() {
	return bannerImages[heroSwiper.realIndex] || bannerImages[0]
}

function openHeroImageModal() {
	heroImagePreview.src = getCurrentBannerImage();
	heroImagePreview.alt = "Banner image preview";
	heroImageModal.classList.add("open");
	heroImageModal.setAttribute("aria-hidden", "false")
}

function closeHeroImageModal() {
	heroImageModal.classList.remove("open");
	heroImageModal.setAttribute("aria-hidden", "true")
}

function setTheme(theme) {
	document.body.dataset.theme = theme;
	localStorage.setItem("health-center-theme", theme);
	const isDark = theme === "dark";
	themeToggle.setAttribute("aria-pressed", String(isDark));
	themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
	themeToggleIcon.innerHTML = isDark ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"></circle><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"></path></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"></path></svg>'
}

function toggleTheme() {
	setTheme(document.body.dataset.theme === "dark" ? "light" : "dark")
}
themeToggle.addEventListener("click", toggleTheme);
setTheme(localStorage.getItem("health-center-theme") || "light");
openHeroImage.addEventListener("click", openHeroImageModal);
closeHeroImage.addEventListener("click", closeHeroImageModal);
heroImageModal.addEventListener("click", event => {
	if (event.target === heroImageModal) {
		closeHeroImageModal()
	}
});

function openMapModal() {
	mapModal.classList.add("open");
	mapModal.setAttribute("aria-hidden", "false")
}

function closeMapPopup() {
	mapModal.classList.remove("open");
	mapModal.setAttribute("aria-hidden", "true")
}

function formatDateLabel(date) {
	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	}).format(date)
}

function normalizeDateValue(value) {
	const date = new Date(`${value}T00:00:00`);
	date.setHours(0, 0, 0, 0);
	return date
}

function getSelectedDayKey(dateValue) {
	return dayNames[normalizeDateValue(dateValue).getDay()]
}

function getDoctorAvailability(doctor, dayKey) {
	return doctor.schedule.find(slot => slot.days.includes(dayKey)) || null
}

function renderDoctorsForDate(dateValue) {
	const dayKey = getSelectedDayKey(dateValue);
	const selectedDate = normalizeDateValue(dateValue);
	const availableDoctors = doctors.map(doctor => {
		const slot = getDoctorAvailability(doctor, dayKey);
		return slot ? {
			...doctor,
			slot
		} : null
	}).filter(Boolean);
	doctorCards.innerHTML = "";
	doctorCards.classList.toggle("empty", availableDoctors.length === 0);
	if (!availableDoctors.length) {
		doctorCards.innerHTML = '<div class="empty-state">No doctors are scheduled for this date.</div>';
		return
	}
	availableDoctors.forEach((doctor, index) => {
		const card = document.createElement("div");
		card.className = `card${index===0?" active":""}`;
		card.addEventListener("click", () => selectCard(card));
		card.innerHTML = `\n                    <div class="card-img"><img src="${doctor.photo}" alt="${doctor.name}"></div>\n                    <div class="card-name">${doctor.name}</div>\n                    <div class="card-role">${doctor.role}</div>\n                    <div class="card-date">Available on ${formatDateLabel(selectedDate)}</div>\n                    <div class="card-timing">${doctor.slot.label}</div>\n                `;
		doctorCards.appendChild(card)
	})
}

function updateChosenDate(dateValue) {
	const selectedDate = normalizeDateValue(dateValue);
	chosenDateText.textContent = formatDateLabel(selectedDate);
	dateInput.value = dateValue;
	renderDoctorsForDate(dateValue)
}

function selectCard(selectedElement) {
	const cards = document.querySelectorAll(".card");
	cards.forEach(card => card.classList.remove("active"));
	selectedElement.classList.add("active")
}
openDatePicker.addEventListener("click", () => {
	if (typeof dateInput.showPicker === "function") {
		dateInput.showPicker()
	} else {
		dateInput.click()
	}
});
dateInput.addEventListener("change", () => {
	if (dateInput.value) {
		updateChosenDate(dateInput.value)
	}
});
prevBanner.addEventListener("click", () => {
	heroSwiper.slidePrev()
});
nextBanner.addEventListener("click", () => {
	heroSwiper.slideNext()
});
openMapLink.addEventListener("click", event => {
	event.preventDefault();
	openMapModal()
});
closeMapModal.addEventListener("click", closeMapPopup);
mapModal.addEventListener("click", event => {
	if (event.target === mapModal) {
		closeMapPopup()
	}
});
window.addEventListener("keydown", event => {
	if (event.key === "Escape") {
		closeHeroImageModal();
		closeMapPopup()
	}
});
const today = new Date;
const todayValue = (new Date).toISOString().slice(0, 10);
dateInput.min = todayValue;
dateInput.value = todayValue;
updateBannerImage(0);
updateChosenDate(todayValue);
