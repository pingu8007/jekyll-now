function renderCaptcha(obs) {
  let el = document.getElementById("make_comment");
  let tHint = el.querySelector("span.hint");
  if (obs) obs.unobserve(el);
  grecaptcha.render(el.querySelector("button.g-recaptcha"), {
    callback: token => {
      tHint.classList.remove("success", "warning", "error");
      tHint.textContent = "Submitting, wait a moment...";
      let qs = new URLSearchParams();
      new FormData(el).forEach((v, k) => qs.append(k, v));
      fetch(el.action, { body: qs, method: "POST", }).then(res => res.json().then(body => {
        if (!res.ok) throw new Error(body.message || body.errorCode || "Failed");
        tHint.classList.add("success");
        tHint.textContent = "Success. Your comment may need 1~2 minutes to be visible.";
        el.reset();
      })).catch(e => {
        console.error(e);
        tHint.classList.add("error");
        tHint.textContent = e.message;
      }).then(() => grecaptcha.reset());
    }
  });
}
function initSubmit() {
  let el = document.getElementById("make_comment");
  if (el == null) return;
  if (window.IntersectionObserver) new IntersectionObserver(
    (entries, obs) => entries.forEach(entry => entry.isIntersecting && renderCaptcha(obs))
  ).observe(el);
  else renderCaptcha();
}
window.addEventListener('message', (event) => {
  if (typeof (event.data) == 'string' && event.data.startsWith("staticman|authdata|")) {
    let payload = JSON.parse(event.data.substr(19))
    document.querySelector("#make_comment input[name='options[auth-data]']").value = payload.data;
    window.auth.close();
  }
});