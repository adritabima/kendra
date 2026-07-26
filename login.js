document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginAccessForm');
  if (!form) return;

  const message = document.getElementById('loginFormMessage');
  const validate = () => {
    const email = form.elements.email;
    const phone = form.elements.phone;
    const emailValue = email.value.trim();
    const phoneDigits = phone.value.replace(/\D/g, '');

    email.setCustomValidity(emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) ? 'Please enter a correct email address.' : '');
    phone.setCustomValidity(phone.value.trim() && !/^[6-9]\d{9}$/.test(phoneDigits) ? 'Please enter a correct 10-digit mobile number.' : '');
    message.textContent = email.validationMessage || phone.validationMessage;
    return !message.textContent;
  };

  form.addEventListener('input', validate);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate() || !form.reportValidity()) return;

    const values = new FormData(form);
    const text = [
      'Hello Adrita Bima Kendra, I would like client portal access.',
      '',
      `Name: ${values.get('name')}`,
      `Email: ${values.get('email')}`,
      `Mobile: ${values.get('phone')}`,
    ].join('\n');
    window.open(`https://wa.me/919474862701?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });
});
