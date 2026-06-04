// =========================
// COUNTDOWN TIMER
// =========================

// Set future date (change as needed)
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 1);
targetDate.setHours(targetDate.getHours() + 2);
targetDate.setMinutes(targetDate.getMinutes() + 30);

function updateCountdown() {

    const countdownElements =
        document.querySelectorAll(".countdown");

    const now = new Date().getTime();

    const distance =
        targetDate.getTime() - now;

    if (distance <= 0) {

        countdownElements.forEach(el => {
            el.innerHTML = "Session Started";
        });

        return;
    }

    const days =
        Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours =
        Math.floor(
            (distance % (1000 * 60 * 60 * 24))
            / (1000 * 60 * 60)
        );

    const minutes =
        Math.floor(
            (distance % (1000 * 60 * 60))
            / (1000 * 60)
        );

    countdownElements.forEach(el => {

        el.innerHTML =
            `Starts in ${days}d ${hours}h ${minutes}m`;

    });
}

updateCountdown();

setInterval(updateCountdown, 1000);


// =========================
// COPY MEETING LINK
// =========================

function copyMeetingLink() {

    const link =
        document.getElementById("meetingLink");

    if (!link) return;

    navigator.clipboard.writeText(
        link.innerText
    );

    alert("Meeting link copied!");
}


// =========================
// JOIN SESSION
// =========================

function joinSession() {

    const link =
        document.getElementById("meetingLink");

    if (!link) {

        alert("Meeting link not found");
        return;
    }

    const meetingURL =
        link.innerText.trim();

    if (
        meetingURL === "" ||
        meetingURL === "Meeting Link"
    ) {

        alert("No meeting available.");
        return;
    }

    window.open(
        meetingURL,
        "_blank"
    );
}


// =========================
// PREVIOUS SESSIONS DATA
// =========================

const sessions = [
    {
        icon: "JS",
        title: "Session",
        date: "Date",
        time: "Time"
    },
    {
        icon: "PY",
        title: "Session",
        date: "Date",
        time: "Time"
    },
    {
        icon: "RE",
        title: "Session",
        date: "Date",
        time: "Time"
    }
];


// =========================
// RENDER PREVIOUS SESSIONS
// =========================

const sessionContainer =
    document.getElementById(
        "previousSessions"
    );

if (sessionContainer) {

    sessionContainer.innerHTML = "";

    sessions.forEach(session => {

        const card =
        `
        <div class="session-card">

            <div class="session-left">

                <div class="tech-icon">
                    ${session.icon}
                </div>

                <div>

                    <h4>${session.title}</h4>

                    <p>${session.date}</p>

                    <p>${session.time}</p>

                </div>

            </div>

            <div class="session-right">

                <span>Meeting Link</span>

                <button
                    class="copy-btn"
                    onclick="copyMeetingLink()">

                    <i class="fa-regular fa-copy"></i>

                </button>

            </div>

        </div>
        `;

        sessionContainer.innerHTML += card;
    });
}


// =========================
// VIEW BUTTONS
// =========================

const viewButtons =
    document.querySelectorAll(
        ".view-btn"
    );

viewButtons.forEach(btn => {

    btn.addEventListener(
        "click",
        function () {

            alert(
                "Page will be available soon."
            );

        }
    );

});


// =========================
// SMOOTH PAGE LOAD
// =========================

window.addEventListener(
    "load",
    () => {

        document.body.style.opacity = "1";

    }
);