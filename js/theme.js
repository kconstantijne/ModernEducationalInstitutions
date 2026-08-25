(function(){
  const KEY = "stemSchoolTheme";
  function apply(){
    const dark = localStorage.getItem(KEY) === "dark";
    document.body.classList.toggle("dark", dark);
    document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
      btn.textContent = dark ? "☀️ Світла тема" : "🌙 Темна тема";
    });
  }
  document.addEventListener("DOMContentLoaded", ()=>{
    apply();
    document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        localStorage.setItem(KEY, document.body.classList.contains("dark") ? "light" : "dark");
        apply();
      });
    });
  });
})();
