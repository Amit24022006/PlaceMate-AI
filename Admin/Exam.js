/* ==========================
   LOCAL STORAGE HELPERS
========================== */

function getQuestions() {
    return JSON.parse(localStorage.getItem("pm_questions")) || [];
}

function getExams() {
    return JSON.parse(localStorage.getItem("pm_exams")) || [];
}

function getResults() {
    return JSON.parse(localStorage.getItem("pm_results")) || [];
}

function saveResults(results) {
    localStorage.setItem(
        "pm_results",
        JSON.stringify(results)
    );
}

/* ==========================
   GET EXAM ID
========================== */

const params = new URLSearchParams(window.location.search);
const examId = params.get("id");

/* ==========================
   LOAD EXAM
========================== */

const exam = getExams().find(
    e => e.id === examId
);

if (!exam) {
    document.body.innerHTML =
        "<h2>Exam Not Found</h2>";
    throw new Error("Exam Not Found");
}

document.getElementById("examTitle").textContent =
    exam.title;

/* ==========================
   LOAD QUESTIONS
========================== */

const questions = getQuestions().filter(
    q => q.subjectId === exam.subjectId
);

const container =
    document.getElementById("questionsContainer");

questions.forEach((q, index) => {

    let html = `
    <div class="question-card">

        <div class="question">
            Q${index + 1}. ${q.text}
        </div>
    `;

    if (q.options) {

        q.options.forEach((option, i) => {

            html += `
            <label class="option">
                <input
                    type="radio"
                    name="q${index}"
                    value="${i}"
                >
                ${option}
            </label>
            `;
        });

    }

    html += `</div>`;

    container.innerHTML += html;
});

/* ==========================
   TIMER
========================== */

let totalSeconds =
    (exam.duration || 60) * 60;

const timer =
    document.getElementById("timer");

const timerInterval =
    setInterval(() => {

        const mins =
            Math.floor(totalSeconds / 60);

        const secs =
            totalSeconds % 60;

        timer.textContent =
            `${mins}:${String(secs).padStart(2, "0")}`;

        totalSeconds--;

        if (totalSeconds < 0) {

            clearInterval(timerInterval);

            submitExam();
        }

    }, 1000);

/* ==========================
   SUBMIT EXAM
========================== */

function submitExam() {

    clearInterval(timerInterval);

    let score = 0;

    questions.forEach((q, index) => {

        const answer =
            document.querySelector(
                `input[name="q${index}"]:checked`
            );

        if (
            answer &&
            Number(answer.value) === Number(q.correct)
        ) {
            score++;
        }

    });

    const result = {

        id: Date.now(),

        examId: exam.id,

        examTitle: exam.title,

        score: score,

        total: questions.length,

        pct:
            questions.length > 0
                ? Math.round(
                    (score / questions.length) * 100
                )
                : 0,

        date: new Date().toISOString()
    };

    const results = getResults();

    results.push(result);

    saveResults(results);

    document.getElementById("resultArea").innerHTML = `
        <div class="result-box">
            <h2>Exam Submitted</h2>
            <h3>
                Score:
                ${score} / ${questions.length}
            </h3>
            <h3>
                Percentage:
                ${result.pct}%
            </h3>
        </div>
    `;

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
}