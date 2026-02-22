import { useEffect } from 'react';

export const BackgroundEffects = () => {
  useEffect(() => {
    // Generate Matrix Rain Effect
    const generateMatrixRain = () => {
        const matrixRain = document.getElementById('matrixRain');
        if (!matrixRain) return;
        
        matrixRain.innerHTML = ''; // Clear existing
        const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const columns = Math.floor(window.innerWidth / 20);
        
        for (let i = 0; i < columns; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = `${i * 20}px`;
            column.style.animationDuration = `${Math.random() * 5 + 10}s`;
            column.style.animationDelay = `${Math.random() * 5}s`;
            
            // Generate random characters for the column
            let text = '';
            const charCount = Math.floor(Math.random() * 20 + 10);
            for (let j = 0; j < charCount; j++) {
                text += characters[Math.floor(Math.random() * characters.length)] + ' ';
            }
            column.textContent = text;
            
            matrixRain.appendChild(column);
        }
    };

    // Generate Floating Particles
    const generateParticles = () => {
        const particlesContainer = document.getElementById('particlesContainer');
        if (!particlesContainer) return;

        particlesContainer.innerHTML = '';
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${Math.random() * 10 + 20}s`;
            
            particlesContainer.appendChild(particle);
        }
    };

    // Generate Data Streams
    const generateDataStreams = () => {
        const dataStreams = document.getElementById('dataStreams');
        if (!dataStreams) return;

        dataStreams.innerHTML = '';
        const streamCount = 10;
        
        for (let i = 0; i < streamCount; i++) {
            const stream = document.createElement('div');
            stream.className = 'data-stream';
            stream.style.top = `${Math.random() * 100}%`;
            stream.style.left = `-300px`;
            stream.style.animationDelay = `${Math.random() * 5}s`;
            stream.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
            
            dataStreams.appendChild(stream);
        }
    };

    // Interactive mouse glow effect (throttled for performance)
    let mouseTimer: ReturnType<typeof setTimeout> | null;
    const handleMouseMove = (e: MouseEvent) => {
        if (!mouseTimer) {
            mouseTimer = setTimeout(() => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                // Move orbs slightly based on mouse position
                const orbs = document.querySelectorAll<HTMLElement>('.orb');
                orbs.forEach((orb, index) => {
                    const speed = (index + 1) * 0.02;
                    const x = (mouseX - window.innerWidth / 2) * speed;
                    const y = (mouseY - window.innerHeight / 2) * speed;
                    orb.style.transform = `translate(${x}px, ${y}px)`;
                });
                
                // Make nearby particles glow brighter (desktop only)
                if (window.innerWidth > 768) {
                    const particles = document.querySelectorAll<HTMLElement>('.particle');
                    particles.forEach(particle => {
                        const rect = particle.getBoundingClientRect();
                        const particleX = rect.left + rect.width / 2;
                        const particleY = rect.top + rect.height / 2;
                        const distance = Math.sqrt(Math.pow(mouseX - particleX, 2) + Math.pow(mouseY - particleY, 2));
                        
                        if (distance < 150) {
                            const brightness = 1 - (distance / 150);
                            particle.style.boxShadow = `0 0 ${20 + brightness * 30}px rgba(0, 255, 255, ${0.5 + brightness * 0.5})`;
                            particle.style.transform = `scale(${1 + brightness * 0.5})`;
                        } else {
                            particle.style.boxShadow = '';
                            particle.style.transform = '';
                        }
                    });
                }
                
                mouseTimer = null;
            }, 16); // ~60fps
        }
    };

    // Random cyber text effects
    const cyberTexts = ['VOU FALAR COM MEU SÓCIO', 'LCDev.click', 'NEURAL LINK ESTABLISHED', 'QUANTUM SYNC ACTIVE', 'REALITY MATRIX LOADED'];
    const textInterval = setInterval(() => {
        const randomText = cyberTexts[Math.floor(Math.random() * cyberTexts.length)];
        const tempElement = document.createElement('div');
        tempElement.textContent = randomText;
        tempElement.style.cssText = `
            position: fixed;
            top: ${Math.random() * 100}vh;
            left: ${Math.random() * 100}vw;
            color: var(--primary-cyan);
            font-size: 0.8rem;
            font-weight: 700;
            z-index: 1000;
            opacity: 0.7;
            pointer-events: none;
            animation: fadeOut 3s ease-out forwards;
            text-shadow: 0 0 10px var(--primary-cyan);
        `;
        document.body.appendChild(tempElement);
        
        setTimeout(() => {
            if(document.body.contains(tempElement)) {
                document.body.removeChild(tempElement);
            }
        }, 3000);
    }, 5000);

    generateMatrixRain();
    generateParticles();
    generateDataStreams();

    document.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const matrixRain = document.getElementById('matrixRain');
            if (matrixRain) matrixRain.innerHTML = '';
            generateMatrixRain();
        }, 250);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        clearInterval(textInterval);
    };
  }, []);

  return (
    <>
        <div className="cyber-bg">
            <div className="cyber-gradient"></div>
            <div className="matrix-rain" id="matrixRain"></div>
        </div>
        
        <div className="particles" id="particlesContainer"></div>
        
        <div className="data-streams" id="dataStreams"></div>
        
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        
        <div className="grid-overlay">
            <div className="grid-lines"></div>
            <div className="grid-glow"></div>
        </div>
        
        <div className="scanlines"></div>
        <div className="noise-overlay"></div>
    </>
  );
};
