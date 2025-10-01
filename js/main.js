document.addEventListener('DOMContentLoaded', function () {

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top-btn');

    window.onscroll = function () {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    };

    backToTopBtn.addEventListener('click', function () {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    });


    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-toggle');
    const navTabs = document.querySelector('.nav-tabs');

    if (mobileMenuButton && navTabs) {
        mobileMenuButton.addEventListener('click', () => {
            navTabs.classList.toggle('active');
            const isExpanded = navTabs.classList.contains('active');
            mobileMenuButton.setAttribute('aria-expanded', isExpanded);
        });
    }

});