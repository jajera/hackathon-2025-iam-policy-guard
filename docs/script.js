(function () {
  const body = document.body;
  const toggleBtn = document.getElementById("theme-toggle");
  const THEME_KEY = "prefers-dark"; // localStorage key holding "true" | "false"

  // Slide Management
  let currentSlide = 0;
  const totalSlides = 5;
  const slides = document.querySelectorAll('.slide');
  const navBtns = document.querySelectorAll('.nav-btn');
  const currentSlideSpan = document.getElementById('current-slide');
  const totalSlidesSpan = document.getElementById('total-slides');

  // Initialize slides
  function initSlides() {
    totalSlidesSpan.textContent = totalSlides;
    updateSlide();
  }

  // Change to specific slide
  window.changeSlide = function (index) {
    if (index >= 0 && index < totalSlides) {
      currentSlide = index;
      updateSlide();
    }
  };

  // Next slide
  window.nextSlide = function () {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
  };

  // Previous slide
  window.previousSlide = function () {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide();
  };

  // Update slide display
  function updateSlide() {
    // Update slides
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index === currentSlide) {
        slide.classList.add('active');
      } else if (index < currentSlide) {
        slide.classList.add('prev');
      }
    });

    // Update navigation buttons
    navBtns.forEach((btn, index) => {
      btn.classList.toggle('active', index === currentSlide);
    });

    // Update slide indicator
    currentSlideSpan.textContent = currentSlide + 1;
  }

  // Keyboard navigation (will be replaced with enhanced version below)

  // Touch/swipe support
  let startX = 0;
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  document.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = startX - endX;
    const diffY = startY - endY;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }

    startX = 0;
    startY = 0;
  });

  // Theme Management
  /**
   * Apply the theme to the document
   * @param {boolean} prefersDark - whether dark mode should be enabled
   */
  function applyTheme(prefersDark) {
    if (prefersDark) {
      body.classList.add("dark");
      toggleBtn.textContent = "☀️";
      toggleBtn.setAttribute("aria-label", "Switch to light mode");
    } else {
      body.classList.remove("dark");
      toggleBtn.textContent = "🌙";
      toggleBtn.setAttribute("aria-label", "Switch to dark mode");
    }
  }

  // Determine initial preference: user saved? else system preference.
  function getInitialPreference() {
    const fromStorage = localStorage.getItem(THEME_KEY);
    if (fromStorage !== null) {
      return fromStorage === "true";
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Set initial theme
  let prefersDark = getInitialPreference();
  applyTheme(prefersDark);

  // Listen for system changes if user hasn't overridden
  if (localStorage.getItem(THEME_KEY) === null && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", (e) => {
      prefersDark = e.matches;
      applyTheme(prefersDark);
    });
  }

  // Toggle handler
  toggleBtn.addEventListener("click", () => {
    prefersDark = !prefersDark;
    localStorage.setItem(THEME_KEY, prefersDark.toString());
    applyTheme(prefersDark);
  });

  // Image Modal Functions
  window.openImageModal = function (imgElement) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');

    modalImg.src = imgElement.src;
    modalImg.alt = imgElement.alt;
    modal.classList.add('active');

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  window.closeImageModal = function () {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = '';
  };

  // Close modal when clicking on background
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('image-modal');
    if (e.target === modal) {
      closeImageModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('image-modal');
      if (modal && modal.classList.contains('active')) {
        e.preventDefault();
        closeImageModal();
        return;
      }
    }

    // Existing keyboard navigation (only if modal is not open)
    const modal = document.getElementById('image-modal');
    if (modal && modal.classList.contains('active')) {
      return; // Don't handle slide navigation when modal is open
    }

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        previousSlide();
        break;
      case 'Home':
        e.preventDefault();
        changeSlide(0);
        break;
      case 'End':
        e.preventDefault();
        changeSlide(totalSlides - 1);
        break;
    }
  });

  // Initialize presentation
  document.addEventListener('DOMContentLoaded', () => {
    initSlides();
  });

  // If DOM already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlides);
  } else {
    initSlides();
  }
})();
