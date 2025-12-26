document.addEventListener('DOMContentLoaded', function () {
  // preserve existing 'action' handler if element exists
  var actionEl = document.getElementById('action');
  if (actionEl) {
    actionEl.addEventListener('click', function () {
      var now = new Date().toLocaleTimeString();
      alert('Hello — you clicked the button!\nTime: ' + now);
    });
  }

  var contactBtn = document.getElementById('contact-btn');
  var overlay = document.getElementById('contact-modal-overlay');
  var closeBtn = document.getElementById('contact-modal-close');

  function openModal() {
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus the close button for accessibility
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (contactBtn) {
    contactBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      closeModal();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
});
