/**
 * StockNest Login Page
 * Handles password visibility toggle and form submission.
 */

(function () {
  'use strict';

  // Firebase configuration placeholder
  // TODO: Replace with your actual Firebase project web configuration keys
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Initialize Firebase if loaded and config is populated
  let isFirebaseConfigured = false;
  if (typeof firebase !== 'undefined') {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
      firebase.initializeApp(firebaseConfig);
      isFirebaseConfigured = true;
    } else {
      console.warn("⚠️ Firebase configuration keys are placeholders. Fill them in to enable Google Sign-in.");
    }
  }

  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  const loginForm = document.getElementById('loginForm');
  const googleSignInBtn = document.getElementById('googleSignInBtn');

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

  const loginAlert = document.getElementById('loginAlert');
  const submitButton = loginForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;

  function showAlert(message, type = 'error') {
    loginAlert.textContent = message;
    loginAlert.className = `form-alert form-alert--${type}`;
    loginAlert.style.display = 'block';
  }

  function hideAlert() {
    loginAlert.style.display = 'none';
    loginAlert.textContent = '';
  }

  /**
   * Handle login form submission.
   */
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    hideAlert();

    const email = document.getElementById('emailOrPhone').value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!email || !password) {
      showAlert('Please enter both email and password.');
      return;
    }

    try {
      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = 'Logging in... <span class="btn-arrow" aria-hidden="true">→</span>';

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Success
      showAlert('Login successful! Redirecting...', 'success');
      
      // Save token in localStorage or sessionStorage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));

      console.log('Logged in user:', data.user);
      
      // Redirect after a short delay (e.g. 1 second)
      // setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
    } catch (err) {
      showAlert(err.message);
    } finally {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });

  /**
   * Handle Google Sign-in.
   */
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async function () {
      hideAlert();

      if (!isFirebaseConfigured) {
        showAlert('Firebase Google Sign-In is not configured on the frontend yet (API key placeholders found in login.js).');
        return;
      }

      try {
        googleSignInBtn.disabled = true;
        const originalGoogleText = googleSignInBtn.innerHTML;
        googleSignInBtn.innerHTML = 'Signing in...';

        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        // Get the Firebase ID Token
        const idToken = await user.getIdToken();

        // Send token to backend
        const response = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to authenticate Google user with backend.');
        }

        // Success
        showAlert('Google Login successful! Redirecting...', 'success');

        // Save token in localStorage or sessionStorage
        const rememberMe = document.getElementById('rememberMe').checked;
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        storage.setItem('user', JSON.stringify(data.user));

        console.log('Logged in user via Google:', data.user);
        
        // Redirect after a short delay (e.g. 1 second)
        // setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
      } catch (err) {
        console.error('Google Sign-in error:', err);
        showAlert(err.message || 'An error occurred during Google Sign-in.');
      } finally {
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = `
          <svg class="btn-google__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign in with Google
        `;
      }
    });
  }
})();
