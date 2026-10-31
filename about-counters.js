document.addEventListener('DOMContentLoaded', function () {
  var counters = document.querySelectorAll('.about-counter[data-target]');

  function animateCounter(element) {
    var target = Number(element.dataset.target);
    var decimals = Number(element.dataset.decimals || 0);
    var suffix = element.dataset.suffix || '';
    var duration = 1600;
    var startedAt = null;

    function update(now) {
      if (!startedAt) startedAt = now;
      var progress = Math.min((now - startedAt) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      element.textContent = value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (progress < 1) window.requestAnimationFrame(update);
    }

    window.requestAnimationFrame(update);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  var observer = new IntersectionObserver(function (entries, activeObserver) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  counters.forEach(function (counter) { observer.observe(counter); });
});
