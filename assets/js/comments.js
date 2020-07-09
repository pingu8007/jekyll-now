function postCaptcha(token) {
  var el = document.getElementById("make_comment");
  if (el == null) return;
  var qs = new URLSearchParams();
  new FormData(el).forEach((v, k) => qs.append(k, v));
  fetch(el.action, { body: qs, method: "POST", }).then(res => {
    if (!res.ok) {
      res.json().then(body => {
        alert(body.message || body.errorCode || "Failed to post comments");
      });
    }
  }).catch(err => console.log(err)).then(() => { grecaptcha.reset() })
}