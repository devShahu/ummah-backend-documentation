document.addEventListener('DOMContentLoaded', function() {
    // Navigation highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const navList = document.getElementById('navList');
    
    // Postman and Swagger import buttons
    const postmanImport = document.getElementById('postmanImport');
    const swaggerImport = document.getElementById('swaggerImport');
    
    // Function to highlight active section in navigation
    function highlightActiveSection() {
        let scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Function to handle search
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm === '') {
            // Reset all items to visible
            document.querySelectorAll('.endpoint').forEach(endpoint => {
                endpoint.style.display = 'block';
            });
            return;
        }
        
        // Search in endpoints
        document.querySelectorAll('.endpoint').forEach(endpoint => {
            const title = endpoint.querySelector('h3').textContent.toLowerCase();
            const path = endpoint.querySelector('.path').textContent.toLowerCase();
            const method = endpoint.querySelector('.method').textContent.toLowerCase();
            const description = endpoint.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || 
                path.includes(searchTerm) || 
                method.includes(searchTerm) || 
                description.includes(searchTerm)) {
                endpoint.style.display = 'block';
            } else {
                endpoint.style.display = 'none';
            }
        });
    }
    
    // Function to handle smooth scrolling for anchor links
    function smoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetElement.offsetTop - 20,
            behavior: 'smooth'
        });
        
        // Update URL hash without scrolling
        history.pushState(null, null, targetId);
    }
    
    // Add event listeners
    window.addEventListener('scroll', highlightActiveSection);
    searchInput.addEventListener('input', handleSearch);
    
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    // Postman import button
    if (postmanImport) {
        postmanImport.addEventListener('click', function() {
            // This would typically open a Postman import URL
            // For demo purposes, we'll just open a new tab with Postman
            window.open('https://www.postman.com/downloads/', '_blank');
        });
    }
    
    // Swagger import button
    if (swaggerImport) {
        swaggerImport.addEventListener('click', function() {
            // This would typically open a Swagger UI URL
            // For demo purposes, we'll just open a new tab with Swagger
            window.open('https://swagger.io/tools/swagger-ui/', '_blank');
        });
    }
    
    // Initialize
    highlightActiveSection();
    
    // Code highlighting is handled by highlight.js which is loaded in the HTML
});