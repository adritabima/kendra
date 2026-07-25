document.addEventListener('DOMContentLoaded', () => {
  const notification = document.getElementById('homeNotification');
  if (notification) {
    const closeNotification = () => notification.classList.add('is-hidden');
    const duration = Number(notification.dataset.duration) || 5000;
    const closeButton = notification.querySelector('.home-notification-close');
    closeButton.addEventListener('click', closeNotification);
    window.setTimeout(closeNotification, duration);
  }

  const validateContactDetails = (form) => {
    const email = form.elements.email;
    const phone = form.elements.phone;
    const feedback = form.querySelector('.form-validation-message');
    const emailValue = email.value.trim();
    const phoneDigits = phone.value.replace(/\D/g, '');

    email.setCustomValidity(emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
      ? 'Please enter a correct email address.'
      : '');
    phone.setCustomValidity(phone.value.trim() && !/^[6-9]\d{9}$/.test(phoneDigits)
      ? 'Please enter a correct 10-digit mobile number.'
      : '');

    const message = email.validationMessage || phone.validationMessage;
    if (feedback) feedback.textContent = message;
    return !message;
  };

  const animateCounter = (element) => {
    const target = Number(element.dataset.target);
    const decimals = Number(element.dataset.decimals || 0);
    const suffix = element.dataset.suffix || '';
    const duration = 1400;
    const startedAt = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      element.textContent = `${value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const counters = document.querySelectorAll('.counter[data-target]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counters.forEach((counter) => observer.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const form = document.getElementById('homeWhatsappForm');
  if (!form) return;
  form.addEventListener('input', () => validateContactDetails(form));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateContactDetails(form)) {
      form.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const message = [
      'Hello Adrita Bima Kendra, I would like to discuss my financial goals.',
      '',
      `Name: ${values.get('name')}`,
      `Email: ${values.get('email')}`,
      `Mobile: ${values.get('phone') || 'Not provided'}`,
      `Message: ${values.get('message')}`,
    ].join('\n');
    window.open(`https://wa.me/919474862701?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
});
