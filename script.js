document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const iconStyles = document.createElement('link');
        iconStyles.rel = 'stylesheet';
        iconStyles.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css';
        document.head.appendChild(iconStyles);
    }

    document.querySelectorAll('.brand-logo').forEach((logo) => {
        logo.src = 'Adrita Bima Logo.jpeg';
        logo.alt = 'Adrita Bima Kendra logo';
    });

    if (!document.querySelector('.brand-logo')) {
        const compactHeader = document.createElement('header');
        compactHeader.className = 'logo-only-header';
        compactHeader.innerHTML = `
            <div class="container logo-only-header-inner">
                <a class="logo" href="index.html" aria-label="Adrita Bima Kendra home">
                    <img class="brand-logo" src="Adrita Bima Logo.jpeg" alt="Adrita Bima Kendra logo">
                    <h2><span>ADRITA</span> BIMA KENDRA</h2>
                </a>
                <a class="logo-only-contact" href="contact.html">Contact Us</a>
            </div>
        `;
        document.body.prepend(compactHeader);
    }

    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const footerPages = new Set(['calculator.html', 'market.html', 'faq.html', 'login.html']);
    if (footerPages.has(currentPage)) {
        const existingFooter = document.querySelector('footer');
        const marketWatchlist = existingFooter?.querySelector('.watchlist');
        if (marketWatchlist) existingFooter.before(marketWatchlist);
        if (existingFooter) existingFooter.remove();

        const sharedFooter = document.createElement('footer');
        sharedFooter.className = 'shared-site-footer';
        sharedFooter.innerHTML = `
            <div class="container footer-grid">
                <div><h2>Adrita Bima Kendra</h2><p>Your trusted financial partner for Insurance, Mutual Funds, Wealth Management, Income Tax &amp; GST Services.</p></div>
                <div><h3>Quick Links</h3><ul><li><a href="index.html">Home</a></li><li><a href="about.html">About</a></li><li><a href="services.html">Services</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="contact.html">Contact</a></li></ul></div>
                <div><h3>Our Services</h3><ul><li>Life Insurance</li><li>Mutual Funds</li><li>Health Insurance</li><li>Income Tax</li><li>GST Services</li></ul></div>
                <div><h3>Office</h3><p><i class="fa-solid fa-location-dot"></i> Khalna, Hatpara Bazar, Howrah</p><p><i class="fa-solid fa-phone"></i> 9474862701</p><p><i class="fa-solid fa-envelope"></i> adritabimakendra@gmail.com</p></div>
            </div>
            <div class="copyright">&copy; 2026 Adrita Bima Kendra. All Rights Reserved. Powered by <a href="https://www.banisatya.com/" target="_blank" rel="noopener noreferrer">Banisatya Wealth Pvt Ltd</a>.</div>
        `;
        const firstScript = Array.from(document.body.children).find((element) => element.tagName === 'SCRIPT');
        document.body.insertBefore(sharedFooter, firstScript || null);
    }

    document.querySelectorAll('.whatsapp, #scrollTop').forEach((element) => element.remove());

    const floatingActions = document.createElement('div');
    floatingActions.className = 'floating-actions';
    floatingActions.innerHTML = `
        <a class="floating-call" href="tel:+919474862701" aria-label="Call Adrita Bima Kendra"><i class="fa-solid fa-phone"></i></a>
        <button class="floating-whatsapp" type="button" aria-label="Open WhatsApp enquiry form"><i class="fa-brands fa-whatsapp"></i></button>
    `;
    document.body.appendChild(floatingActions);

    const modal = document.createElement('div');
    modal.className = 'whatsapp-enquiry-modal';
    modal.hidden = true;
    modal.innerHTML = `
        <div class="whatsapp-enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="whatsappEnquiryTitle">
            <button class="whatsapp-modal-close" type="button" aria-label="Close enquiry form">&times;</button>
            <div class="whatsapp-modal-heading"><i class="fa-brands fa-whatsapp"></i><div><h2 id="whatsappEnquiryTitle">Start Your Enquiry</h2><p>Send your details directly to us on WhatsApp.</p></div></div>
            <form id="whatsappModalForm" novalidate>
                <input type="text" name="name" placeholder="Your Name" required>
                <input type="email" name="email" placeholder="Email Address" required>
                <input type="tel" name="phone" placeholder="10-digit Mobile Number" inputmode="numeric" maxlength="10" required>
                <textarea name="message" placeholder="How can we help you?" rows="4" required></textarea>
                <p class="form-validation-message" aria-live="polite"></p>
                <button class="whatsapp-form-submit" type="submit"><i class="fa-brands fa-whatsapp"></i> Send on WhatsApp</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const openModal = () => {
        modal.hidden = false;
        document.body.classList.add('modal-open');
        modal.querySelector('[name="name"]').focus();
    };
    const closeModal = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        floatingActions.querySelector('.floating-whatsapp').focus();
    };
    floatingActions.querySelector('.floating-whatsapp').addEventListener('click', openModal);
    modal.querySelector('.whatsapp-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

    const modalForm = modal.querySelector('#whatsappModalForm');
    const validateModalForm = () => {
        const email = modalForm.elements.email;
        const phone = modalForm.elements.phone;
        const feedback = modalForm.querySelector('.form-validation-message');
        const emailValue = email.value.trim();
        const phoneDigits = phone.value.replace(/\D/g, '');
        email.setCustomValidity(emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) ? 'Please enter a correct email address.' : '');
        phone.setCustomValidity(phone.value.trim() && !/^[6-9]\d{9}$/.test(phoneDigits) ? 'Please enter a correct 10-digit mobile number.' : '');
        feedback.textContent = email.validationMessage || phone.validationMessage;
        return !feedback.textContent;
    };
    modalForm.addEventListener('input', validateModalForm);
    modalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validateModalForm() || !modalForm.reportValidity()) return;
        const values = new FormData(modalForm);
        const message = [
            'Hello Adrita Bima Kendra, I would like a free consultation.',
            '',
            `Name: ${values.get('name')}`,
            `Email: ${values.get('email')}`,
            `Mobile: ${values.get('phone')}`,
            `Message: ${values.get('message')}`,
        ].join('\n');
        window.open(`https://wa.me/919474862701?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });

    const revealTargets = document.querySelectorAll(
        'section, .hero, .market-widget, .mover-box, .gallery-item, .service-card, .feature-card, .contact-card'
    );
    const hoverTargets = document.querySelectorAll(
        '.service-card, .feature-card, .mover-box, .gallery-item, .contact-card, .market-widget'
    );

    hoverTargets.forEach((element) => element.classList.add('card-hover'));

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealTargets.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            activeObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((element, index) => {
        element.classList.add('reveal-on-scroll');
        element.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
        observer.observe(element);
    });
});
