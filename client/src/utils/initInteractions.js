// Webflow exports depend on webflow.js for animations.
// In React/Vite we don't run webflow.js, so some elements stay opacity:0.
// These fallbacks keep the layout visible and re-add a couple effects.

export function initWebflowFallback(root = document) {
  // 1) Force Webflow-animated elements to be visible.
  // Webflow exports often leave *inline* opacity:0 + transform on elements and rely on webflow.js to animate them.
  // In Vite/React we don't run webflow.js, so we aggressively reveal those elements.

  // a) Elements that Webflow tags with data-w-id
  root.querySelectorAll('[data-w-id]').forEach((el) => {
    const s = el.style;
    if (!s) return;
    if (s.opacity === '0' || s.opacity === 0) s.opacity = '1';
    if (s.transform && s.transform !== 'none') s.transform = '';
  });

  // b) Elements that use the common "animate-on-load-XX" classes (no data-w-id)
  root.querySelectorAll('[class^="animate-on-load"], [class*=" animate-on-load"], [class^="animate-on-scroll"], [class*=" animate-on-scroll"]').forEach((el) => {
    const s = el.style;
    if (!s) return;
    if (s.opacity === '0' || s.opacity === 0) s.opacity = '1';
    if (s.transform && s.transform !== 'none') s.transform = '';
  });

  // c) Last-resort: anything that is still inline-hidden
  root
    .querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"], [style*="transform:"]')
    .forEach((el) => {
      const s = el.style;
      if (!s) return;
      if (s.opacity === '0' || s.opacity === 0) s.opacity = '1';
      if (s.transform && s.transform !== 'none') s.transform = '';
    });

  // 2) Trustbar: add the class that the original inline <script> added.
  const trustbar = root.querySelector('.trustbar-inner');
  if (trustbar && !trustbar.classList.contains('is-visible')) {
    // Slight delay so it matches the rest of the page fade.
    setTimeout(() => {
      trustbar.classList.add('is-visible');
      // Also mark the outer container visible if present so styles targeting
      // `.trustbar.is-visible` also take effect (some CSS variants target the outer node).
      const outer = trustbar.closest('.trustbar');
      if (outer && !outer.classList.contains('is-visible')) {
        outer.classList.add('is-visible');
      }
    }, 350);
  }
}

export function initFaqAccordions(root = document) {
  // Variant A: .faq-item -> .faq-question + .faq-answer
  const items = root.querySelectorAll('.faq-item');
  items.forEach((item) => {
    // Prevent double-binding on hot reload
    if (item.dataset.svBound === '1') return;
    item.dataset.svBound = '1';

    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    // Start collapsed
    if (!item.classList.contains('is-open')) {
      answer.style.maxHeight = '0px';
      answer.style.overflow = 'hidden';
    }

    question.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      if (open) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0px';
      }
    });
  });

  // Variant B (Webflow export): .ease-faq-container-01 -> .ease-faq-title-holder + .ease-faq-answer-holder
  const easeItems = root.querySelectorAll('.ease-faq-container-01');
  easeItems.forEach((item) => {
    if (item.dataset.svBound === '1') return;
    item.dataset.svBound = '1';

    const title = item.querySelector('.ease-faq-title-holder');
    const answer = item.querySelector('.ease-faq-answer-holder');
    if (!title || !answer) return;

    // Remove inline onclick from static HTML (it won't work in React anyway)
    title.removeAttribute('onclick');

    // Start collapsed
    item.classList.remove('is-open');
    answer.style.maxHeight = '0px';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 300ms ease';

    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      if (open) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0px';
      }
    });
  });
}

export function initPhoneFloat(root = document) {
  // Any element with .sv-float will get a gentle floating animation.
  root.querySelectorAll('.sv-float').forEach((el) => {
    el.style.willChange = 'transform';
  });
}

export function initNavbarMenu(root = document) {
  // Find the hamburger button and nav menu
  const menuButton = root.querySelector('.menu-button.w-nav-button, #mobile-menu-btn');
  const navMenu = root.querySelector('.nav-menu.w-nav-menu');
  const navbar = root.querySelector('.navbar');
  
  if (!menuButton || !navMenu) {
    console.warn('[initNavbarMenu] Menu button or nav menu not found');
    return;
  }
  
  // Prevent double-binding
  if (menuButton.dataset.svNavBound === '1') {
    return;
  }
  menuButton.dataset.svNavBound = '1';
  
  console.log('[initNavbarMenu] Initializing mobile menu');
  
  // Add mobile CTA buttons to the menu if not already added AND on mobile viewport
  function addMobileCTA() {
    // Only add on mobile viewport
    if (window.innerWidth > 991) {
      console.log('[initNavbarMenu] Skipping mobile CTA - desktop viewport');
      return;
    }
    
    // Check if already added
    if (navMenu.querySelector('.mobile-menu-cta')) {
      console.log('[initNavbarMenu] Mobile CTA already exists');
      return;
    }
    
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'mobile-menu-cta';
    ctaContainer.style.cssText = 'padding: 20px 30px 30px 30px; display: flex; flex-direction: column; gap: 0;';
    
    // Create Join Waitlist button (only this one, no Sign In)
    const waitlistBtn = document.createElement('a');
    waitlistBtn.href = '/waitlist';
    waitlistBtn.className = 'nav-cta-button mobile-cta-btn';
    waitlistBtn.textContent = 'JOIN THE WAITLIST';
    waitlistBtn.style.cssText = 'width: 100%; text-align: center; padding: 16px 28px; background: linear-gradient(90deg, #2962FF, #7B2CBF, #FFB800); background-size: 200% 200%; color: #fff; font-size: 16px; font-weight: bold; text-transform: uppercase; text-decoration: none; border-radius: 100px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; border: none; display: block;';
    
    // Add click handler to close menu
    waitlistBtn.addEventListener('click', closeMenu);
    
    ctaContainer.appendChild(waitlistBtn);
    navMenu.appendChild(ctaContainer);
    
    console.log('[initNavbarMenu] Added mobile CTA button');
  }
  
  // Remove mobile CTA if it exists
  function removeMobileCTA() {
    const mobileCTA = navMenu.querySelector('.mobile-menu-cta');
    if (mobileCTA) {
      mobileCTA.remove();
      console.log('[initNavbarMenu] Removed mobile CTA button');
    }
  }
  
  // Add CTA on init if mobile
  addMobileCTA();
  
  // Toggle menu function
  function toggleMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const isOpen = navMenu.classList.contains('sv-open');
    
    if (isOpen) {
      navMenu.classList.remove('sv-open');
      menuButton.classList.remove('sv-open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      console.log('[initNavbarMenu] Menu closed');
    } else {
      navMenu.classList.add('sv-open');
      menuButton.classList.add('sv-open');
      menuButton.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Prevent scroll when menu open
      console.log('[initNavbarMenu] Menu opened');
    }
  }
  
  // Close menu function
  function closeMenu() {
    navMenu.classList.remove('sv-open');
    menuButton.classList.remove('sv-open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    console.log('[initNavbarMenu] Menu closed');
  }
  
  // Add click handler to menu button
  menuButton.addEventListener('click', toggleMenu);
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Toggle navigation menu');
  
  // Close menu when clicking nav links
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (navbar && !navbar.contains(e.target) && navMenu.classList.contains('sv-open')) {
      closeMenu();
    }
  });
  
  // Close menu on window resize to desktop
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 991) {
        // Close menu if open
        if (navMenu.classList.contains('sv-open')) {
          closeMenu();
        }
        // Remove mobile CTA on desktop
        removeMobileCTA();
      } else {
        // Add mobile CTA if resized to mobile
        addMobileCTA();
      }
    }, 250);
  });
  
  console.log('[initNavbarMenu] Mobile menu initialized successfully');
}

export function initAllInteractions(root = document) {
  initWebflowFallback(root);
  initFaqAccordions(root);
  initPhoneFloat(root);
  initCardPointerFollow(root);
  initNavbarMenu(root);
}

// Backwards-compatible name used by our page components.
// Some earlier versions imported `initPageInteractions`.
export function initPageInteractions(root = document) {
  return initAllInteractions(root);
}

// Card pointer-follow effect: makes the card subtly rotate/translate toward cursor
export function initCardPointerFollow(root = document) {
  const containers = Array.from(root.querySelectorAll('.card-image-on-app-holder'));
  if (!containers.length) return;

  containers.forEach((container) => {
    if (container.dataset.svCardBound === '1') return;
    container.dataset.svCardBound = '1';

    const card = container.querySelector('.card-image-on-app-cta') || container.querySelector('img');
    if (!card) return;

    let raf = null;
    let lastX = 0;
    let lastY = 0;

    const maxRotate = 8; // degrees
    const maxTranslate = 10; // px

    function update() {
      const el = card;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = lastX - cx;
      const dy = lastY - cy;

      const nx = Math.max(-1, Math.min(1, dx / (rect.width / 2)));
      const ny = Math.max(-1, Math.min(1, dy / (rect.height / 2)));

      // Inverted mapping so cursor at bottom-left feels like "pushing" the card:
      // - rotateY follows nx (left -> negative rotateY)
      // - rotateX is inverted relative to ny so cursor below pushes the card down
      const rotateY = nx * maxRotate;
      const rotateX = -ny * maxRotate;

      const translateX = nx * maxTranslate;
      const translateY = ny * maxTranslate;

      el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1,1,1)`;
      el.style.transformStyle = 'preserve-3d';
      raf = null;
    }

    function onPointerMove(e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      card.style.transform = '';
      card.style.transformStyle = '';
    }

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onLeave);
    container.addEventListener('pointercancel', onLeave);
  });
}

export default initAllInteractions;
