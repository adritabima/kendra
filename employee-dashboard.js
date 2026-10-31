document.addEventListener('DOMContentLoaded', async () => {
  const request = async (path, options = {}) => {
    const response = await fetch(path, { credentials: 'same-origin', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Unable to verify your session.');
    return data;
  };

  const checkboxes = [...document.querySelectorAll('[data-task]')];
  const taskProgress = document.getElementById('taskProgress');
  const taskProgressBar = document.getElementById('taskProgressBar');
  const updateTasks = () => {
    const complete = checkboxes.filter((checkbox) => checkbox.checked).length;
    taskProgress.textContent = `${complete}/${checkboxes.length}`;
    taskProgressBar.style.width = `${(complete / checkboxes.length) * 100}%`;
    checkboxes.forEach((checkbox) => localStorage.setItem(`adrita-dashboard-${checkbox.dataset.task}`, String(checkbox.checked)));
  };

  try {
    const employee = await request('/api/session');
    document.getElementById('employeeName').textContent = employee.name;
    document.getElementById('employeeGreeting').textContent = employee.name;
  } catch {
    window.location.replace('login.html');
    return;
  }

  document.getElementById('todayDate').textContent = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  checkboxes.forEach((checkbox) => {
    checkbox.checked = localStorage.getItem(`adrita-dashboard-${checkbox.dataset.task}`) === 'true';
    checkbox.addEventListener('change', updateTasks);
  });
  updateTasks();

  document.getElementById('logoutButton').addEventListener('click', async () => {
    try { await request('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); }
    finally { window.location.replace('login.html'); }
  });
});
