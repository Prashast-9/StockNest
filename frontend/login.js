/**
 * StockNest Login Page
 * Handles password visibility toggle and form submission.
 */

(function () {
  'use strict';

  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  const loginForm = document.getElementById('loginForm');

  if (!passwordInput || !passwordToggle || !loginForm) {
    return;
  }

  /**
   * Toggle password field visibility between masked and plain text.
   */
  function togglePasswordVisibility() {
    const isVisible = passwordInput.type === 'text';

    passwordInput.type = isVisible ? 'password' : 'text';
    passwordToggle.classList.toggle('is-visible', !isVisible);
    passwordToggle.setAttribute('aria-pressed', String(!isVisible));
    passwordToggle.setAttribute(
      'aria-label',
      isVisible ? 'Show password' : 'Hide password'
    );
  }

  passwordToggle.addEventListener('click', togglePasswordVisibility);

  /**
   * Handle login form submission.
   * Replace the placeholder logic with an API call to your auth endpoint.
   */
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const emailOrPhone = document.getElementById('emailOrPhone').value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!emailOrPhone || !password) {
      return;
    }

    // TODO: Connect to StockNest auth API (e.g. POST /api/auth/login)
    window.location.href = 'dashboard.html';
  });
})();
