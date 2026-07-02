/**
 * StockNest Sign Up Page
 */

(function () {
  'use strict';

  var form = document.getElementById('signupForm');
  if (!form) return;

  var passwordInput = document.getElementById('password');
  var confirmPasswordInput = document.getElementById('confirmPassword');

  function setupPasswordToggle(toggleId, input) {
    var toggle = document.getElementById(toggleId);
    if (!toggle || !input) return;

    toggle.addEventListener('click', function () {
      var isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      toggle.classList.toggle('is-visible', !isVisible);
      toggle.setAttribute('aria-pressed', String(!isVisible));
      toggle.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
    });
  }

  setupPasswordToggle('passwordToggle', passwordInput);
  setupPasswordToggle('confirmPasswordToggle', confirmPasswordInput);

  function setError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + 'Error');
    if (input) input.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function clearErrors() {
    ['fullName', 'email', 'phone', 'password', 'confirmPassword'].forEach(function (id) {
      setError(id, '');
    });
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validatePhone(value) {
    return /^[\d\s\-+().]{7,20}$/.test(value);
  }

  function validateForm() {
    clearErrors();
    var valid = true;

    var fullName = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var password = passwordInput.value;
    var confirmPassword = confirmPasswordInput.value;

    if (!fullName || fullName.length < 2) {
      setError('fullName', 'Please enter your full name.');
      valid = false;
    }

    if (!email || !validateEmail(email)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    }

    if (!phone || !validatePhone(phone)) {
      setError('phone', 'Please enter a valid phone number.');
      valid = false;
    }

    if (!password || password.length < 8) {
      setError('password', 'Password must be at least 8 characters.');
      valid = false;
    }

    if (password !== confirmPassword) {
      setError('confirmPassword', 'Passwords do not match.');
      valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateForm()) return;

    alert('Account created successfully');
    window.location.href = 'index.html';
  });
})();
