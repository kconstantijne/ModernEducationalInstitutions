
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-lesson-progress]").forEach(el => el.textContent = Progress.lessonProgress(el.dataset.lessonProgress) + "%");
  document.querySelectorAll("[data-progress-fill]").forEach(el => el.style.width = Progress.lessonProgress(el.dataset.progressFill) + "%");
  document.querySelectorAll("[data-activity]").forEach(input => {
    const [lessonId, activityId] = input.dataset.activity.split(":");
    input.checked = Progress.isComplete(lessonId, activityId);
    syncCheckboxVisual(input);
    input.addEventListener("change", () => {
      if (input.checked) Progress.complete(lessonId, activityId);
      else Progress.uncomplete(lessonId, activityId);
      syncCheckboxVisual(input); refreshPageProgress();
    });
  });
  document.querySelectorAll(".task[data-task]").forEach(task => {
    const lessonId = task.dataset.lesson, activityId = task.dataset.activity;
    if (Progress.isComplete(lessonId, activityId)) markTask(task, true, "Виконано правильно ✓");
  });
  document.querySelectorAll("[data-check-task]").forEach(btn => btn.addEventListener("click", () => checkTask(btn.closest(".task"))));
  document.querySelectorAll("[data-speak-en]").forEach(btn => btn.addEventListener("click", () => speak(btn.dataset.speakEn, "en-US")));
  document.querySelectorAll("[data-speak-uk]").forEach(btn => btn.addEventListener("click", () => speak(btn.dataset.speakUk, "uk-UA")));
  refreshPageProgress();
});
function syncCheckboxVisual(input) { input.closest(".activity")?.classList.toggle("done", input.checked) }
function norm(v) { return String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ").replace(",", ".") }
function checkTask(task) {
  if (!task) return;
  const type = task.dataset.type, expected = task.dataset.answer || "", tolerance = parseFloat(task.dataset.tolerance || "0");
  let correct = false;
  if (type === "text") {
    correct = norm(task.querySelector("[data-answer-input]")?.value) === norm(expected);
  } else if (type === "number") {
    const actual = parseFloat(String(task.querySelector("[data-answer-input]")?.value || "").replace(",", "."));
    const exp = parseFloat(expected); correct = Number.isFinite(actual) && Math.abs(actual - exp) <= tolerance;
  } else if (type === "select") {
    correct = task.querySelector("[data-answer-input]")?.value === expected;
  } else if (type === "radio") {
    correct = task.querySelector("[data-answer-input]:checked")?.value === expected;
  } else if (type === "checkboxes") {
    const values = [...task.querySelectorAll("[data-answer-input]:checked")].map(x => x.value).sort();
    correct = values.join("|") === (expected.split("|").map(norm).sort().join("|"));
  } else if (type === "contains") {
    const actual = norm(task.querySelector("[data-answer-input]")?.value);
    correct = expected.split("|").every(x => actual.includes(norm(x)));
  }
  markTask(task, correct);
}
function markTask(task, correct, message) {
  task.classList.toggle("correct", correct); task.classList.toggle("incorrect", !correct);
  const feedback = task.querySelector(".feedback");
  if (correct) {
    feedback.className = "feedback success"; feedback.textContent = message || "Правильно! Завдання виконано ✓";
    Progress.complete(task.dataset.lesson, task.dataset.activity);
  } else {
    feedback.className = "feedback error"; feedback.textContent = "Спробуй ще раз. Перевір відповідь і повтори спробу.";
    Progress.uncomplete(task.dataset.lesson, task.dataset.activity);
  }
  refreshPageProgress();
}
function refreshPageProgress() {
  document.querySelectorAll("[data-lesson-progress]").forEach(el => el.textContent = Progress.lessonProgress(el.dataset.lessonProgress) + "%");
  document.querySelectorAll("[data-progress-fill]").forEach(el => el.style.width = Progress.lessonProgress(el.dataset.progressFill) + "%");
  const stats = Progress.stats();
  document.querySelectorAll("[data-overall-progress]").forEach(el => el.textContent = stats.overall + "%");
  document.querySelectorAll("[data-streak]").forEach(el => el.textContent = stats.streak);
}
function speak(text, lang) {
  if (!("speechSynthesis" in window)) { alert("Озвучення не підтримується цим браузером."); return }
  speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = 0.88; speechSynthesis.speak(u);
}
