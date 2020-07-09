function postCaptcha(token) {
  var el = document.getElementById("make_comment");
  if (el == null) return;
  var hint = el.getElementsByClassName("hint")[0];
  var qs = new URLSearchParams();
  new FormData(el).forEach((v, k) => qs.append(k, v));
  fetch(el.action, { body: qs, method: "POST", }).then(res => res.json().then(body => {
    if (!res.ok)
      throw new Error(body.message || body.errorCode || "Failed to create comment");
    hint.classList.remove("error");
    hint.textContent = "Saved";
    el.reset();
  })).catch(e => {
    console.error(e);
    hint.classList.add("error");
    hint.textContent = e.message;
  }).then(() => grecaptcha.reset());
}