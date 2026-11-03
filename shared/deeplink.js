/* Opens a specific game tab or lab experiment when the page is linked to with
   ?g=<game-id>  (on games.html, matches a <button data-g="..."> in the tab list)
   ?e=<exp-id>   (on lab.html, matches the id of an experiment-picker button)
   See shared/manifest.json for the valid ids per lesson. Safe no-op if the
   param is missing or doesn't match anything on the page. */
(function () {
  function run() {
    try {
      var p = new URLSearchParams(location.search);
      var g = p.get("g");
      if (g) {
        var tab = document.querySelector('nav button[data-g="' + g + '"]');
        if (tab) tab.click();
      }
      var e = p.get("e");
      if (e) {
        var pick = document.getElementById(e);
        if (pick) pick.click();
      }
    } catch (err) {}
  }
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run);
})();
