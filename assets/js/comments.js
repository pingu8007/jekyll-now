var commentForm = document.getElementById("make_comment");
if (commentForm !== null) {
  commentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var qs = new URLSearchParams();
    new FormData(e.target).forEach((v, k) => qs.append(k, v));
    fetch(e.target.action, { body: qs, method: "POST", }).then(res => {
      if (!res.ok) {
        res.json().then(body => {
          alert(body.message || body.errorCode || "Failed to post comments");
        });
      }
    }).catch(err => console.log(err)).then(() => { grecaptcha.reset() })
  })
}