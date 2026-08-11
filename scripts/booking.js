const SESSION_KEY = "hcrs_session";
if (sessionStorage.getItem(SESSION_KEY) !== "authenticated") {
	window.location.replace("login.html")
}
const MOCK_TODAY = new Date;
const DAY_DOWS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const doctors = [{
	name: "Dr. Deepa Shah",
	role: "Medical Consultant",
	photo: "photos/Deepa.jpg",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 13.30 to 16.30 hrs",
		start: "13:30",
		end: "16:30"
	}]
}, {
	name: "Dr. Bhavesh Panchal",
	role: "Medical Consultant",
	photo: "photos/Bhavesh.jpg",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 16.30 to 18.30 hrs",
		start: "16:30",
		end: "18:30"
	}, {
		days: ["sat"],
		label: "Sat: 11.00 to 13.00 hrs",
		start: "11:00",
		end: "13:00"
	}]
}, {
	name: "Dr. Vinita Bhoja Shetty",
	role: "Medical Officer",
	photo: "photos/Vinita.png",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 09:00 to 18:00 hrs",
		start: "09:00",
		end: "18:00"
	}]
}, {
	name: "Dr. Navdeep Tiwari",
	role: "Resident Medical Doctor",
	photo: "photos/Navdeep.png",
	schedule: [{
		days: ["mon", "tue", "wed", "thu", "fri"],
		label: "Mon to Fri: 17:00 to 21:00 hrs",
		start: "17:00",
		end: "21:00"
	}, {
		days: ["sun"],
		label: "Sun: 10:00 to 13:00 hrs",
		start: "10:00",
		end: "13:00"
	}]
}, {
	name: "Dr. Aakriti Jha",
	role: "Consultant Psychiatrist",
	photo: "photos/Aakriti Jha.png",
	schedule: [{
		days: ["fri"],
		label: "Fri: 13:00 to 15:00 hrs",
		start: "13:00",
		end: "15:00"
	}]
}, {
	name: "Dr. Jainisha Patel",
	role: "Gynecologist",
	photo: "photos/jainisha.png",
	schedule: [{
		days: ["wed", "fri"],
		label: "Wed & Fri: 15:00 to 16:30 hrs",
		start: "15:00",
		end: "16:30"
	}]
}, {
	name: "Dr. Maulik Kapadia",
	role: "Pediatrician",
	photo: "photos/maulik.png",
	schedule: [{
		days: ["tue", "thu"],
		label: "Tue & Thu: 15:00 to 16:30 hrs",
		start: "15:00",
		end: "16:30"
	}]
}, {
	name: "Dr. Darshan Patel",
	role: "Visiting Physiotherapy Consultant",
	photo: "photos/Darshan Patel - Visiting Physiotherapy Consultant.jpg",
	schedule: [{
		days: ["wed"],
		label: "Wed: 16:00 to 18:00 hrs",
		start: "16:00",
		end: "18:00"
	}]
}, {
	name: "Dr. Himani Patel",
	role: "Visiting Physiotherapy Consultant",
	photo: "photos/Himani Patel - Visiting Physiotherapy Consultant.jpg",
	schedule: [{
		days: ["tue", "wed", "thu", "fri", "sat"],
		label: "Tue to Sat: 10:00 to 13:00 hrs",
		start: "10:00",
		end: "13:00"
	}]
}];
let currentWeekStartDate = getSunday(MOCK_TODAY);
let doctorTimeRange = {
	start: "09:00",
	end: "18:00"
};
const SLOT_LOGIC_VERSION = "v2";
if (localStorage.getItem("slotLogicVersion") !== SLOT_LOGIC_VERSION) {
	localStorage.removeItem("slotStatesMap");
	localStorage.removeItem("weekMyReservationGenerated");
	localStorage.setItem("slotLogicVersion", SLOT_LOGIC_VERSION)
}
let slotStatesMap = JSON.parse(localStorage.getItem("slotStatesMap")) || {};
let slotSummariesMap = JSON.parse(localStorage.getItem("slotSummariesMap")) || {};
let weekMyReservationGenerated = JSON.parse(localStorage.getItem("weekMyReservationGenerated")) || {};

function getSunday(d) {
	const date = new Date(d);
	date.setHours(0, 0, 0, 0);
	const day = date.getDay();
	const diff = date.getDate() - day;
	const sun = new Date(date.setDate(diff));
	sun.setHours(0, 0, 0, 0);
	return sun
}

function getWeekDaysList(sunday) {
	const days = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(sunday);
		d.setDate(sunday.getDate() + i);
		d.setHours(0, 0, 0, 0);
		days.push(d)
	}
	return days
}

function formatDateKey(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`
}

function formatDateDM(date) {
	const d = String(date.getDate()).padStart(2, "0");
	const m = String(date.getMonth() + 1).padStart(2, "0");
	return `${d}/${m}`
}

function formatWeekRange(sunday) {
	const saturday = new Date(sunday);
	saturday.setDate(sunday.getDate() + 6);

	function formatDate(d) {
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const year = d.getFullYear();
		return `${day}/${month}/${year}`
	}
	return `${formatDate(sunday)} - ${formatDate(saturday)}`
}

function getDoctorTimeRange(doctor) {
	let minStart = "24:00";
	let maxEnd = "00:00";
	doctor.schedule.forEach(s => {
		if (s.start < minStart) minStart = s.start;
		if (s.end > maxEnd) maxEnd = s.end
	});
	return {
		start: minStart,
		end: maxEnd
	}
}

function genSlotsForRange(startStr, endStr) {
	const slots = [];
	let [sh, sm] = startStr.split(":").map(Number);
	let [eh, em] = endStr.split(":").map(Number);
	let h = sh,
		m = sm;
	while (h < eh || h === eh && m < em) {
		slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
		m += 10;
		if (m >= 60) {
			m = 0;
			h++
		}
	}
	return slots
}

function isDoctorWorking(doctor, date, slotTimeStr) {
	const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
	const dayName = dayNames[date.getDay()];
	const item = doctor.schedule.find(s => s.days.includes(dayName));
	if (!item) return false;
	return slotTimeStr >= item.start && slotTimeStr < item.end
}

function parseJumpDate(str) {
	let m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
	if (m) {
		const d = parseInt(m[1], 10);
		const month = parseInt(m[2], 10) - 1;
		const y = parseInt(m[3], 10);
		return new Date(y, month, d)
	}
	m = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
	if (m) {
		const y = parseInt(m[1], 10);
		const month = parseInt(m[2], 10) - 1;
		const d = parseInt(m[3], 10);
		return new Date(y, month, d)
	}
	return new Date(str)
}

function getWeekOffset(sundayDate) {
	const todaySunday = getSunday(MOCK_TODAY);
	const diffMs = sundayDate.getTime() - todaySunday.getTime();
	return Math.round(diffMs / (7 * 24 * 60 * 60 * 1e3))
}

function initWeekSlots(sundayDate, doctor) {
	const days = getWeekDaysList(sundayDate);
	const sundayKey = formatDateKey(sundayDate);
	const genKey = `${doctor.name}_${sundayKey}`;
	const weekOffset = getWeekOffset(sundayDate);
	days.forEach(day => {
		const dateKey = formatDateKey(day);
		const range = getDoctorTimeRange(doctor);
		const slots = genSlotsForRange(range.start, range.end);
		slots.forEach(slot => {
			const stateKey = `${doctor.name}_${dateKey}_${slot}`;
			if (slotStatesMap[stateKey] === "mine" || slotStatesMap[stateKey] === "avail_user") return;
			if (slotStatesMap[stateKey]) return;
			if (!isDoctorWorking(doctor, day, slot)) {
				slotStatesMap[stateKey] = "dash";
				return
			}
			if (weekOffset < 0) {
				slotStatesMap[stateKey] = Math.random() < .3 ? "past-reserved" : "past-unreserved";
				return
			}
			if (weekOffset === 0) {
				const slotDateTime = new Date(day);
				const [sh, sm] = slot.split(":").map(Number);
				slotDateTime.setHours(sh, sm, 0, 0);
				if (slotDateTime < MOCK_TODAY) {
					slotStatesMap[stateKey] = Math.random() < .3 ? "past-reserved" : "past-unreserved"
				} else {
					slotStatesMap[stateKey] = Math.random() < .3 ? "reserved" : "avail"
				}
				return
			}
			if (weekOffset === 1) {
				slotStatesMap[stateKey] = Math.random() < .3 ? "reserved" : "avail";
				return
			}
			slotStatesMap[stateKey] = "avail"
		})
	});
	if (!weekMyReservationGenerated[genKey] && (weekOffset === 0 || weekOffset === 1)) {
		if (Math.random() < .5) {
			const availStateKeys = [];
			days.forEach(day => {
				const dateKey = formatDateKey(day);
				const range = getDoctorTimeRange(doctor);
				const slots = genSlotsForRange(range.start, range.end);
				slots.forEach(slot => {
					const stateKey = `${doctor.name}_${dateKey}_${slot}`;
					if (slotStatesMap[stateKey] === "avail") {
						if (weekOffset === 0) {
							const slotDateTime = new Date(day);
							const [sh, sm] = slot.split(":").map(Number);
							slotDateTime.setHours(sh, sm, 0, 0);
							if (slotDateTime >= MOCK_TODAY) availStateKeys.push(stateKey)
						} else {
							availStateKeys.push(stateKey)
						}
					}
				})
			});
			if (availStateKeys.length > 0) {
				const randomKey = availStateKeys[Math.floor(Math.random() * availStateKeys.length)];
				slotStatesMap[randomKey] = "mine";
				slotSummariesMap[randomKey] = "Sample reservation"
			}
		}
		weekMyReservationGenerated[genKey] = true;
		localStorage.setItem("slotStatesMap", JSON.stringify(slotStatesMap));
		localStorage.setItem("slotSummariesMap", JSON.stringify(slotSummariesMap));
		localStorage.setItem("weekMyReservationGenerated", JSON.stringify(weekMyReservationGenerated))
	} else if (!weekMyReservationGenerated[genKey]) {
		weekMyReservationGenerated[genKey] = true;
		localStorage.setItem("slotStatesMap", JSON.stringify(slotStatesMap));
		localStorage.setItem("weekMyReservationGenerated", JSON.stringify(weekMyReservationGenerated))
	}
}

function getDayAvailabilityStatus(day, doctor) {
	const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
	const dayName = dayNames[day.getDay()];
	const activeSchedule = doctor.schedule.find(s => s.days.includes(dayName));
	if (!activeSchedule) return {
		text: "(Unavailable)",
		isSunSat: day.getDay() === 0 || day.getDay() === 6
	};
	const dateKey = formatDateKey(day);
	const range = getDoctorTimeRange(doctor);
	const slots = genSlotsForRange(range.start, range.end);
	let workingSlotsCount = 0;
	let availCount = 0;
	let bookedCount = 0;
	slots.forEach(slot => {
		const stateKey = `${doctor.name}_${dateKey}_${slot}`;
		const state = slotStatesMap[stateKey];
		if (state && state !== "dash") {
			workingSlotsCount++;
			if (state === "avail" || state === "mine") {
				availCount++
			} else if (state === "reserved" || state === "past-reserved") {
				bookedCount++
			}
		}
	});
	if (workingSlotsCount === 0) return {
		text: "(Unavailable)",
		isSunSat: day.getDay() === 0 || day.getDay() === 6
	};
	const endOfDay = new Date(day);
	endOfDay.setHours(23, 59, 59, 999);
	if (endOfDay < MOCK_TODAY) {
		return {
			text: "(Past)",
			isSunSat: false
		}
	}
	if (availCount === 0) {
		return {
			text: "(Fully Booked)",
			isSunSat: false
		}
	} else if (bookedCount === 0) {
		return {
			text: "(Available)",
			isSunSat: false
		}
	} else {
		return {
			text: "(Partially Available)",
			isSunSat: false
		}
	}
}

function populateDoctorSelect() {
	const select = document.getElementById("doctorSelect");
	select.innerHTML = "";
	doctors.forEach((doc, idx) => {
		const opt = document.createElement("option");
		opt.value = idx;
		const scheduleLabel = doc.schedule.map(s => s.label).join(" & ");
		opt.textContent = `${doc.name} (${doc.role}) — ${scheduleLabel}`;
		select.appendChild(opt)
	})
}

function updateDoctorCard(doctor) {
	document.getElementById("docName").textContent = doctor.name;
	document.getElementById("docRole").textContent = doctor.role;
	const avatarContainer = document.getElementById("docAvatar");
	avatarContainer.innerHTML = `\n        <img src="${doctor.photo}" alt="${doctor.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">\n        <svg style="display:none;" viewBox="0 0 64 64">\n          <circle cx="32" cy="32" r="32" fill="#f6d3ae" />\n          <circle cx="32" cy="26" r="11" fill="#3a2a20" />\n          <path d="M14 58c2-12 10-18 18-18s16 6 18 18" fill="#2f6fb0" />\n          <circle cx="32" cy="30" r="9" fill="#f6d3ae" />\n        </svg>\n      `;
	const hoursContainer = document.getElementById("docWorkingHours");
	hoursContainer.innerHTML = doctor.schedule.map(s => `<div class="info-line">${s.label}</div>`).join("")
}

function renderHead() {
	const sunday = currentWeekStartDate;
	document.getElementById("weekRangeLabel").textContent = formatWeekRange(sunday);
	const todaySunday = getSunday(MOCK_TODAY);
	const diffTime = sunday.getTime() - todaySunday.getTime();
	const diffDays = Math.round(diffTime / (1e3 * 60 * 60 * 24));
	let tag = "(This Week)";
	if (diffDays < 0) {
		tag = "(Past Week)"
	} else if (diffDays > 0) {
		tag = "(Upcoming Week)"
	}
	document.getElementById("weekTag").textContent = tag;
	const row = document.getElementById("tableHeadRow");
	row.querySelectorAll("th.dayth").forEach(el => el.remove());
	const days = getWeekDaysList(sunday);
	const selectedDocIndex = document.getElementById("doctorSelect").value;
	const doctor = doctors[selectedDocIndex];
	days.forEach(day => {
		const th = document.createElement("th");
		th.className = "dayth";
		const dow = DAY_DOWS[day.getDay()];
		const dateStr = formatDateDM(day);
		const statusObj = getDayAvailabilityStatus(day, doctor);
		const colorClass = statusObj.isSunSat ? "var(--sun-sat)" : "var(--weekday)";
		const statusColor = statusObj.text === "(Unavailable)" ? "var(--text-muted)" : statusObj.text === "(Fully Booked)" ? "var(--sun-sat)" : "var(--green)";
		th.innerHTML = `\n          <span class="dow" style="color:${colorClass}">${dow}</span><br>\n          <span class="dm">${dateStr}</span>\n          <span class="status" style="color:${statusColor}">${statusObj.text}</span>\n        `;
		row.appendChild(th)
	})
}

function renderBody() {
	const body = document.getElementById("tableBody");
	body.innerHTML = "";
	const slots = genSlotsForRange(doctorTimeRange.start, doctorTimeRange.end);
	const selectedDocIndex = document.getElementById("doctorSelect").value;
	const doctor = doctors[selectedDocIndex];
	const days = getWeekDaysList(currentWeekStartDate);
	slots.forEach((slot, idx) => {
		const tr = document.createElement("tr");
		let rowHtml = `<td class="srno">${idx+1}</td><td class="timecol">${slot}</td>`;
		days.forEach((day, dIndex) => {
			const dateKey = formatDateKey(day);
			const stateKey = `${doctor.name}_${dateKey}_${slot}`;
			const state = slotStatesMap[stateKey] || "dash";
			rowHtml += `<td>${cellHtml(state,dIndex,slot)}</td>`
		});
		tr.innerHTML = rowHtml;
		body.appendChild(tr)
	})
}

function iconLock() {
	return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h8V8a4 4 0 1 0-8 0z"/></svg>`
}

function cellHtml(state, dIndex, slot) {
	if (state === "dash") return `<div class="cell dash">Unavailable</div>`;
	if (state === "unavail") return `<div class="cell unavail">Unavailable</div>`;
	if (state === "past-reserved") return `<div class="cell past-reserved">Reserved</div>`;
	if (state === "past-unreserved") return `<div class="cell past-unreserved">Unreserved</div>`;
	if (state === "mine") return `<div class="cell mine" data-day="${dIndex}" data-slot="${slot}">My Reservation</div>`;
	if (state === "reserved") return `<div class="cell reserved">Reserved</div>`;
	if (state === "avail") return `<div class="cell avail" data-day="${dIndex}" data-slot="${slot}">${slot}</div>`;
	return `<div class="cell dash">Unavailable</div>`
}
let activeBookingStateKey = null;
let activeBookingDIndex = null;
let activeBookingSlot = null;

function formatDisplayDate(date) {
	const d = String(date.getDate()).padStart(2, "0");
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const y = date.getFullYear();
	return `${d}/${m}/${y}`
}

function addTenMinutes(timeStr) {
	let [h, m] = timeStr.split(":").map(Number);
	m += 10;
	if (m >= 60) {
		m -= 60;
		h += 1
	}
	if (h >= 24) {
		h = 0
	}
	return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`
}

function getDoctorDisplayString(doctor, date) {
	if (!doctor) return "-";
	const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
	const dayName = dayNames[date.getDay()];
	const item = doctor.schedule.find(s => s.days.includes(dayName));
	const scheduleText = item ? `${item.start} to ${item.end}` : doctor.schedule.map(s => `${s.start} to ${s.end}`).join(" & ");
	return `${doctor.name} (${doctor.role}) ${scheduleText}`
}

function showModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.style.display = "flex";
	modal.offsetHeight;
	modal.classList.add("active")
}

function hideModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.classList.remove("active");
	setTimeout(() => {
		modal.style.display = "none"
	}, 250)
}

function attachCellEvents() {
	const body = document.getElementById("tableBody");
	body.onclick = e => {
		const cell = e.target.closest(".cell");
		if (!cell) return;
		const dIndex = cell.getAttribute("data-day");
		const slot = cell.getAttribute("data-slot");
		if (!slot || dIndex === null) return;
		const selectedDocIndex = document.getElementById("doctorSelect").value;
		const doctor = doctors[selectedDocIndex];
		const days = getWeekDaysList(currentWeekStartDate);
		const dateKey = formatDateKey(days[dIndex]);
		const stateKey = `${doctor.name}_${dateKey}_${slot}`;
		activeBookingStateKey = stateKey;
		activeBookingDIndex = dIndex;
		activeBookingSlot = slot;
		const dateObj = days[dIndex];
		const dateStr = formatDisplayDate(dateObj);
		const endTimeStr = addTenMinutes(slot);
		const userNameVal = document.getElementById("userName").textContent.trim();
		const userRollVal = document.getElementById("userRoll").textContent.trim();
		document.getElementById("modalUserName").textContent = `${userNameVal} ${userRollVal}`;
		document.getElementById("modalDoctorName").textContent = getDoctorDisplayString(doctor, dateObj);
		document.getElementById("modalStartDate").textContent = dateStr;
		document.getElementById("modalStartTime").textContent = slot;
		document.getElementById("modalEndDate").textContent = dateStr;
		document.getElementById("modalEndTime").textContent = endTimeStr;
		if (cell.classList.contains("avail")) {
			const summaryInput = document.getElementById("bookingSummary");
			summaryInput.value = "";
			summaryInput.disabled = false;
			summaryInput.placeholder = "Enter reservation summary";
			document.getElementById("submitBookingBtn").style.display = "block";
			document.getElementById("cancelReservationBtn").style.display = "none";
			showModal("bookingModal")
		} else if (cell.classList.contains("mine")) {
			const summaryInput = document.getElementById("bookingSummary");
			summaryInput.value = slotSummariesMap[stateKey] || "";
			summaryInput.disabled = true;
			document.getElementById("submitBookingBtn").style.display = "none";
			document.getElementById("cancelReservationBtn").style.display = "block";
			showModal("bookingModal")
		}
	}
}

function handleDoctorChange() {
	const selectedDocIndex = document.getElementById("doctorSelect").value;
	const doctor = doctors[selectedDocIndex];
	doctorTimeRange = getDoctorTimeRange(doctor);
	updateDoctorCard(doctor);
	initWeekSlots(currentWeekStartDate, doctor);
	renderHead();
	renderBody()
}
document.getElementById("doctorSelect").addEventListener("change", handleDoctorChange);
document.getElementById("prevWeek").addEventListener("click", () => {
	currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
	const selectedDocIndex = document.getElementById("doctorSelect").value;
	const doctor = doctors[selectedDocIndex];
	initWeekSlots(currentWeekStartDate, doctor);
	renderHead();
	renderBody()
});
document.getElementById("nextWeek").addEventListener("click", () => {
	currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
	const selectedDocIndex = document.getElementById("doctorSelect").value;
	const doctor = doctors[selectedDocIndex];
	initWeekSlots(currentWeekStartDate, doctor);
	renderHead();
	renderBody()
});
document.getElementById("jumpDate").addEventListener("keypress", e => {
	if (e.key === "Enter") {
		const val = e.target.value.trim();
		if (!val) return;
		const date = parseJumpDate(val);
		if (date && !isNaN(date.getTime())) {
			currentWeekStartDate = getSunday(date);
			const selectedDocIndex = document.getElementById("doctorSelect").value;
			const doctor = doctors[selectedDocIndex];
			initWeekSlots(currentWeekStartDate, doctor);
			renderHead();
			renderBody();
			e.target.value = ""
		} else {
			alert("Invalid date format. Please use DD/MM/YYYY.")
		}
	}
});

function pad(n) {
	return String(n).padStart(2, "0")
}

function formatTodayDate(date) {
	return `${pad(date.getDate())}-${pad(date.getMonth()+1)}-${date.getFullYear()}`
}

function updateClock() {
	const now = new Date;
	document.getElementById("todayDate").textContent = formatTodayDate(now);
	document.getElementById("todayTime").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}
updateClock();
setInterval(updateClock, 1e3);
let sortAscending = true;

function renderMyBookings() {
	const container = document.getElementById("myBookingsList");
	container.innerHTML = "";
	const reservedKeys = [];
	for (const key in slotStatesMap) {
		if (slotStatesMap[key] === "mine") {
			reservedKeys.push(key)
		}
	}
	if (reservedKeys.length === 0) {
		container.innerHTML = `<div class="no-bookings-placeholder">You have no active reservations.</div>`;
		return
	}
	const bookings = reservedKeys.map(key => {
		const parts = key.split("_");
		const doctorName = parts[0];
		const dateKey = parts[1];
		const slotTime = parts[2];
		const doctor = doctors.find(d => d.name === doctorName);
		return {
			key,
			doctorName,
			doctorRole: doctor ? doctor.role : "Medical Officer",
			doctorPhoto: doctor ? doctor.photo : "logo.svg",
			dateKey,
			slotTime,
			summary: slotSummariesMap[key] || "",
			timestamp: new Date(`${dateKey}T${slotTime}`).getTime()
		}
	});
	bookings.sort((a, b) => {
		if (sortAscending) {
			return a.timestamp - b.timestamp
		} else {
			return b.timestamp - a.timestamp
		}
	});
	bookings.forEach(b => {
		const card = document.createElement("div");
		card.className = "booking-card";
		card.onclick = () => {
			openBookingModalFromCard(b.key)
		};
		const [y, m, d] = b.dateKey.split("-");
		const dateStr = `${d}/${m}/${y}`;
		card.innerHTML = `\n          <div class="card-photo-container">\n            <img src="${b.doctorPhoto}" alt="${b.doctorName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">\n            <svg style="display:none;" viewBox="0 0 64 64">\n              <circle cx="32" cy="32" r="32" fill="#f6d3ae" />\n              <circle cx="32" cy="26" r="11" fill="#3a2a20" />\n              <path d="M14 58c2-12 10-18 18-18s16 6 18 18" fill="#2f6fb0" />\n              <circle cx="32" cy="30" r="9" fill="#f6d3ae" />\n            </svg>\n          </div>\n          <div class="card-main-info">\n            <span class="card-doc-name">${b.doctorName}</span>\n            <span class="card-doc-role">${b.doctorRole}</span>\n          </div>\n          <div class="card-time-info">\n            <span class="card-date">${dateStr}</span>\n            <span class="card-time">${b.slotTime} hrs</span>\n          </div>\n          <div class="card-summary-info">\n            <span class="card-summary-label">Summary</span>\n            ${b.summary||"No summary provided."}\n          </div>\n        `;
		container.appendChild(card)
	})
}

function openBookingModalFromCard(key) {
	const parts = key.split("_");
	const doctorName = parts[0];
	const dateKey = parts[1];
	const slot = parts[2];
	const doctor = doctors.find(d => d.name === doctorName);
	if (!doctor) return;
	activeBookingStateKey = key;
	const dateObj = new Date(`${dateKey}T00:00:00`);
	const dateStr = formatDisplayDate(dateObj);
	const endTimeStr = addTenMinutes(slot);
	const userNameVal = document.getElementById("userName").textContent.trim();
	const userRollVal = document.getElementById("userRoll").textContent.trim();
	document.getElementById("modalUserName").textContent = `${userNameVal} ${userRollVal}`;
	document.getElementById("modalDoctorName").textContent = getDoctorDisplayString(doctor, dateObj);
	document.getElementById("modalStartDate").textContent = dateStr;
	document.getElementById("modalStartTime").textContent = slot;
	document.getElementById("modalEndDate").textContent = dateStr;
	document.getElementById("modalEndTime").textContent = endTimeStr;
	const summaryInput = document.getElementById("bookingSummary");
	summaryInput.value = slotSummariesMap[key] || "";
	summaryInput.disabled = true;
	document.getElementById("submitBookingBtn").style.display = "none";
	document.getElementById("cancelReservationBtn").style.display = "block";
	showModal("bookingModal")
}
document.querySelectorAll(".nav-item").forEach(btn => {
	btn.addEventListener("click", e => {
		e.preventDefault();
		document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
		btn.classList.add("active");
		const tab = btn.getAttribute("data-tab");
		if (tab === "bookings") {
			document.getElementById("schedulerContent").style.display = "block";
			document.getElementById("myBookingsContent").style.display = "none";
			document.getElementById("helpContent").style.display = "none"
		} else if (tab === "mybookings") {
			document.getElementById("schedulerContent").style.display = "none";
			document.getElementById("myBookingsContent").style.display = "block";
			document.getElementById("helpContent").style.display = "none";
			renderMyBookings()
		} else if (tab === "help") {
			document.getElementById("schedulerContent").style.display = "none";
			document.getElementById("myBookingsContent").style.display = "none";
			document.getElementById("helpContent").style.display = "block"
		}
	})
});
document.getElementById("toggleSortBtn").addEventListener("click", () => {
	sortAscending = !sortAscending;
	const text = document.getElementById("sortDirectionText");
	const icon = document.getElementById("sortIcon");
	if (sortAscending) {
		text.textContent = "Ascending";
		icon.innerHTML = '<path d="M12 5v14M5 12l7-7 7 7"/>'
	} else {
		text.textContent = "Descending";
		icon.innerHTML = '<path d="M12 19V5M5 12l7 7 7-7"/>'
	}
	renderMyBookings()
});
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggleSidebarBtn");
if (sidebar && toggleBtn) {
	const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
	if (isCollapsed) {
		sidebar.classList.add("collapsed")
	}
	toggleBtn.addEventListener("click", () => {
		const collapsed = sidebar.classList.toggle("collapsed");
		localStorage.setItem("sidebarCollapsed", collapsed)
	})
}
const pressedKeys = {};
window.addEventListener("keydown", e => {
	pressedKeys[e.key.toLowerCase()] = true;
	if (e.shiftKey && pressedKeys["r"] && pressedKeys["e"]) {
		localStorage.clear();
		location.reload()
	}
});
window.addEventListener("keyup", e => {
	pressedKeys[e.key.toLowerCase()] = false
});
window.addEventListener("blur", () => {
	for (const k in pressedKeys) {
		pressedKeys[k] = false
	}
});
document.getElementById("closeBookingModal").addEventListener("click", () => {
	hideModal("bookingModal")
});
document.getElementById("closeCancelReasonModal").addEventListener("click", () => {
	hideModal("cancelReasonModal")
});
document.getElementById("backToDetailsBtn").addEventListener("click", () => {
	hideModal("cancelReasonModal");
	setTimeout(() => {
		showModal("bookingModal")
	}, 280)
});
document.getElementById("submitBookingBtn").addEventListener("click", () => {
	const summaryInput = document.getElementById("bookingSummary");
	const summaryText = summaryInput.value.trim();
	if (!summaryText) {
		alert("Summary is required.");
		summaryInput.focus();
		return
	}
	if (activeBookingStateKey) {
		slotStatesMap[activeBookingStateKey] = "mine";
		slotSummariesMap[activeBookingStateKey] = summaryText;
		localStorage.setItem("slotStatesMap", JSON.stringify(slotStatesMap));
		localStorage.setItem("slotSummariesMap", JSON.stringify(slotSummariesMap));
		hideModal("bookingModal");
		renderHead();
		renderBody()
	}
});
document.getElementById("bookingSummary").addEventListener("keypress", e => {
	if (e.key === "Enter" && !document.getElementById("bookingSummary").disabled) {
		document.getElementById("submitBookingBtn").click()
	}
});
document.getElementById("cancelReservationBtn").addEventListener("click", () => {
	hideModal("bookingModal");
	setTimeout(() => {
		const reasonInput = document.getElementById("cancelReasonText");
		reasonInput.value = "";
		const confirmBtn = document.getElementById("confirmCancelBtn");
		confirmBtn.disabled = true;
		confirmBtn.className = "btn-danger-disabled";
		showModal("cancelReasonModal")
	}, 280)
});
document.getElementById("cancelReasonText").addEventListener("input", e => {
	const val = e.target.value.trim();
	const confirmBtn = document.getElementById("confirmCancelBtn");
	if (val.length > 0) {
		confirmBtn.disabled = false;
		confirmBtn.className = "btn-danger"
	} else {
		confirmBtn.disabled = true;
		confirmBtn.className = "btn-danger-disabled"
	}
});
document.getElementById("confirmCancelBtn").addEventListener("click", () => {
	if (activeBookingStateKey) {
		slotStatesMap[activeBookingStateKey] = "avail";
		delete slotSummariesMap[activeBookingStateKey];
		localStorage.setItem("slotStatesMap", JSON.stringify(slotStatesMap));
		localStorage.setItem("slotSummariesMap", JSON.stringify(slotSummariesMap));
		hideModal("cancelReasonModal");
		renderHead();
		renderBody();
		renderMyBookings()
	}
});
populateDoctorSelect();
const startupCurrentWeekStart = getSunday(MOCK_TODAY);
const startupNextWeekStart = new Date(startupCurrentWeekStart);
startupNextWeekStart.setDate(startupCurrentWeekStart.getDate() + 7);
doctors.forEach(doc => {
	initWeekSlots(startupCurrentWeekStart, doc);
	initWeekSlots(startupNextWeekStart, doc)
});
handleDoctorChange();
attachCellEvents();
document.getElementById("logoutBtn").addEventListener("click", () => {
	sessionStorage.removeItem(SESSION_KEY);
	window.location.replace("login.html")
});
