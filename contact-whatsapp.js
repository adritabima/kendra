document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('whatsappContactForm');
  if (!form) return;

  const validateContactDetails = () => {
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

  form.addEventListener('input', validateContactDetails);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateContactDetails()) {
      form.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const lines = [
      'Hello Adrita Bima Kendra, I would like to enquire about your services.',
      '',
      `Name: ${values.get('name')}`,
      `Email: ${values.get('email')}`,
      `Mobile: ${values.get('phone') || 'Not provided'}`,
      `Service: ${values.get('service') || 'Not selected'}`,
      `Subject: ${values.get('subject') || 'Not provided'}`,
      `Message: ${values.get('message')}`,
    ];

    const whatsappUrl = `https://wa.me/919474862701?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
});
