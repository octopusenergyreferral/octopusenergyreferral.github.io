/*
 * Lightweight vanilla JS - Optimized for minimal main thread blocking
 */
(function() {
    'use strict';
    
    var body, header, nav, titleBar;

    function init() {
        body = document.body;
        header = document.getElementById('header');
        nav = document.getElementById('nav');
        
        createTitleBar();
        
        // Defer non-critical setup
        if ('requestIdleCallback' in window) {
            requestIdleCallback(setupInteractions, { timeout: 200 });
        } else {
            setTimeout(setupInteractions, 50);
        }
    }

    function createTitleBar() {
        titleBar = document.createElement('div');
        titleBar.id = 'titleBar';
        var logoEl = document.getElementById('logo');
        titleBar.innerHTML = '<a href="#header" class="toggle" aria-label="Toggle navigation menu"></a><span class="title">' + (logoEl ? logoEl.innerHTML : '') + '</span>';
        body.appendChild(titleBar);
        
        titleBar.querySelector('.toggle').addEventListener('click', function(e) {
            e.preventDefault();
            body.classList.toggle('header-visible');
        });
    }

    function setupInteractions() {
        requestAnimationFrame(function() {
            body.classList.remove('is-preload');
        });

        document.addEventListener('click', function(e) {
            if (body.classList.contains('header-visible') && (!header.contains(e.target) || e.target.tagName === 'A')) {
                body.classList.remove('header-visible');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') body.classList.remove('header-visible');
        });

        document.addEventListener('click', function(e) {
            var anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            var targetId = anchor.getAttribute('href');
            if (targetId === '#' || targetId === '#header') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offset = window.innerWidth <= 1024 ? 44 : 0;
                window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
                if (nav) {
                    nav.querySelectorAll('a').forEach(function(a) { a.classList.remove('active'); });
                    anchor.classList.add('active');
                }
            }
        });

        if ('IntersectionObserver' in window && nav) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) entry.target.classList.remove('inactive');
                });
            }, { threshold: 0.2 });

            nav.querySelectorAll('a[href^="#"]').forEach(function(link) {
                var section = document.querySelector(link.getAttribute('href'));
                if (section) {
                    section.classList.add('inactive');
                    observer.observe(section);
                }
            });
        }

        if (header) {
            var touchX = 0;
            header.addEventListener('touchstart', function(e) { touchX = e.touches[0].pageX; }, { passive: true });
            header.addEventListener('touchmove', function(e) {
                if (touchX && touchX - e.touches[0].pageX < -50) {
                    body.classList.remove('header-visible');
                    touchX = 0;
                }
            }, { passive: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
