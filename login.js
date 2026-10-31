document.addEventListener('DOMContentLoaded', () => {
  // The employee portal needs the Python server for secure credential checks.
  // Redirect local file previews to the working local portal automatically.
  const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port !== '8000';
  if (window.location.protocol === 'file:' || isLocalPreview) {
    window.location.replace('http://localhost:8000/login.html');
    return;
  }
  const forms = Object.fromEntries(['login', 'forgot', 'reset'].map((name) => [name, document.getElementById(`${name}Form`)]));
  const status = document.getElementById('authStatus');
  const views = document.querySelectorAll('[data-auth-view]');
  const resetEmail = document.getElementById('resetEmail');
  const forgotEmail = document.getElementById('forgotEmail');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const resetOtp = document.getElementById('resetOtp');
  const newPassword = document.getElementById('newPassword');
  const confirmNewPassword = document.getElementById('confirmNewPassword');

  const showStatus = (text, type = '') => { status.textContent = text; status.className = `auth-status ${type}`; };
  const setFormBusy = (form, busy) => {
    form.setAttribute('aria-busy', String(busy));
    form.querySelectorAll('button[type="submit"]').forEach((button) => {
      button.disabled = busy;
      button.classList.toggle('is-loading', busy);
    });
  };
  const showView = (view) => {
    Object.entries(forms).forEach(([name, form]) => { form.hidden = name !== view; });
    document.querySelectorAll('.auth-tabs button').forEach((button) => {
      const active = button.dataset.authView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    showStatus('');
  };
  const request = async (path, body) => {
    let response;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body), signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The secure login server took too long to respond. Please try again.');
      throw new Error('Cannot connect to the secure login server. Start auth_server.py and open the website through that server.');
    } finally {
      window.clearTimeout(timeout);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
    return data;
  };
  const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordMatch = (password, confirm) => password.length >= 8 && password === confirm;

  views.forEach((button) => button.addEventListener('click', () => showView(button.dataset.authView)));
  document.querySelectorAll('[data-toggle-password]').forEach((button) => button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
    button.querySelector('i').className = visible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
  }));

  forms.login.addEventListener('submit', async (event) => {
    event.preventDefault(); if (forms.login.getAttribute('aria-busy') === 'true') return; const email = loginEmail.value.trim(); const password = loginPassword.value;
    if (!validEmail(email) || !password) return showStatus('Enter a valid email address and password.', 'error');
    setFormBusy(forms.login, true); showStatus('Signing you in…');
    try {
      const data = await request('/api/login', { email, password });
      showStatus(`${data.message} Opening your employee workspace…`, 'success');
      forms.login.reset();
      window.setTimeout(() => { window.location.href = 'employee-dashboard.html'; }, 700);
    }
    catch (error) { showStatus(error.message, 'error'); } finally { setFormBusy(forms.login, false); }
  });
  const sendOtp = async (email) => {
    if (!validEmail(email)) throw new Error('Enter a valid registered email address.');
    return request('/api/forgot-password', { email });
  };
  forms.forgot.addEventListener('submit', async (event) => {
    event.preventDefault(); if (forms.forgot.getAttribute('aria-busy') === 'true') return; const email = forgotEmail.value.trim(); setFormBusy(forms.forgot, true); showStatus('Sending OTP…');
    try {
      const data = await sendOtp(email);
      resetEmail.value = email;
      showView('reset');
      const otpMessage = data.demo_otp ? `Demo OTP: ${data.demo_otp}. Use it to complete password reset.` : data.message;
      showStatus(otpMessage, 'success');
      resetOtp.focus();
    }
    catch (error) { showStatus(error.message, 'error'); } finally { setFormBusy(forms.forgot, false); }
  });
  forms.reset.addEventListener('submit', async (event) => {
    event.preventDefault(); if (forms.reset.getAttribute('aria-busy') === 'true') return; const email = resetEmail.value.trim(), otp = resetOtp.value.replace(/\D/g, ''), password = newPassword.value, confirmPassword = confirmNewPassword.value;
    if (!/^\d{6}$/.test(otp) || !passwordMatch(password, confirmPassword)) return showStatus('Enter the 6-digit OTP and matching passwords of at least 8 characters.', 'error');
    setFormBusy(forms.reset, true); showStatus('Verifying OTP and updating password…');
    try { const data = await request('/api/reset-password', { email, otp, password }); forms.reset.reset(); showView('login'); showStatus(data.message, 'success'); }
    catch (error) { showStatus(error.message, 'error'); } finally { setFormBusy(forms.reset, false); }
  });
  document.getElementById('resendOtp').addEventListener('click', async () => {
    showStatus('Sending a new OTP…');
    try { const data = await sendOtp(resetEmail.value.trim()); showStatus(data.message, 'success'); }
    catch (error) { showStatus(error.message, 'error'); }
  });
});
