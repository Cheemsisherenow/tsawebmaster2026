import React, { useRef, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { statistics } from '../constants';
import clsx from 'clsx';
import InteractivePieChart from './Diagrams/InteractivePieChart';
import SimpleChart from './Diagrams/InteractiveBar';

gsap.registerPlugin(ScrollTrigger);

const Statistics = ({ sphereRef }) => {
    const containerRef = useRef(null);
    const starFieldRef = useRef(null);
    const numStars = 300;

    const isMobile = useMediaQuery({ maxWidth: 767 });

    // reload-on-resize hack — desktop only (mobile fires resize constantly)
    useEffect(() => {
        if (isMobile) return;
        let resizeTimer = null;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                window.location.reload();
            }, 300);
        };

        window.addEventListener('resize', onResize, { passive: true });
        return () => {
            window.removeEventListener('resize', onResize);
            clearTimeout(resizeTimer);
        };
    }, [isMobile]);

    // sphere fly-to-center — desktop only
    useEffect(() => {
        if (isMobile) return;
        const el = sphereRef?.current;
        if (!el) return;

        let st = null;

        requestAnimationFrame(() => {
            const rect      = el.getBoundingClientRect();
            const leftOffset = window.innerHeight * 0.04;
            const initialX  = rect.left - leftOffset;
            const initialY = (window.innerHeight - rect.height) / 2;

            gsap.set(el, {
                position: 'fixed',
                top: 0, left: 0,
                x: initialX,
                y: initialY,
                width:  rect.width,
                height: rect.height,
                margin: 0,
                transformOrigin: 'top left',
                zIndex: 5,
            });

            const targetX = (window.innerWidth  - rect.width)  / 2;
            const targetY = (window.innerHeight - rect.height) / 2 + window.innerHeight * 0.08;

            st = gsap.to(el, {
                scrollTrigger: {
                    trigger: '.scroll-track',
                    start: 'top 90%',
                    end:   'top top',
                    scrub: 1.2,
                    invalidateOnRefresh: true,
                },
                x: targetX,
                y: targetY,
                ease: 'none',
            });
        });

        return () => {
            st?.kill();
            gsap.set(el, { clearProps: 'all' });
        };
    }, [sphereRef, isMobile]);

    // starfield + pinned 3D timeline — desktop only
    useGSAP(() => {
        if (isMobile) return;
        const container = starFieldRef.current;
        if (!container) return;

        const generatedStars = [];

        for (let i = 0; i < numStars; i++) {
            const div  = document.createElement('div');
            const size = Math.random() * 2 + 1;

            div.style.position      = 'absolute';
            div.style.left          = '50%';
            div.style.top           = '50%';
            div.style.width         = `${size * 10}px`;
            div.style.height        = `${size}px`;
            div.style.background    = 'rgba(255, 255, 255, 0.9)';
            div.style.pointerEvents = 'none';
            div.style.opacity       = Math.random() * 0.6 + 0.4;
            div.style.willChange    = 'transform';

            const angle         = Math.random() * Math.PI * 2;
            const rotationAngle = (angle * 180) / Math.PI;
            const radius        = Math.random() * window.innerWidth + 50;
            const startZ        = (Math.random() * -15000) - 5000;

            div.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg) translate3d(${radius}px, 0px, ${startZ}px)`;

            container.appendChild(div);
            generatedStars.push({ element: div, rotation: rotationAngle, radius, startZ });
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.scroll-track',
                start: 'top top',
                end:   'bottom bottom',
                scrub: true,
                pin:   true,
                pinSpacing:    false,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onLeave: () => {
                    const el = sphereRef.current;
                    if (!el) return;
                    const scrollTrack = document.querySelector('.scroll-track');
                    gsap.set(el, {
                        position: 'absolute',
                        zIndex: 5,
                    });
                    scrollTrack.appendChild(el);
                },
                onEnterBack: () => {
                    const el = sphereRef.current;
                    if (!el) return;
                    document.body.appendChild(el);
                    gsap.set(el, {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        margin: 0,
                        transformOrigin: 'top left',
                        zIndex: 5,
                    });
                },
            },
        });

        tl.to(containerRef.current, {
            backgroundColor: '#17252B',
            ease: 'power1.out',
            duration: 1,
        }, 0);

        const sections = gsap.utils.toArray('.wordSection', containerRef.current);
        sections.forEach((section, index) => {
            tl.fromTo(section,
                { z: -3000, opacity: 0, rotateX: 35, rotateY: index % 2 === 0 ? -25 : 25 },
                { z: 0, opacity: 1, rotateX: 0, rotateY: 0, ease: 'power2.out', duration: 1 },
                index === 0 ? 0.1 : '+=0.2'
            )
            .to(section, { z: 2000, opacity: 0, ease: 'power2.in', duration: 1 }, '+=0.5');
        });

        const sequenceDuration = tl.duration();

        generatedStars.forEach((star) => {
            tl.to(star.element, {
                transform: `translate(-50%, -50%) rotate(${star.rotation}deg) translate3d(${star.radius}px, 0px, ${star.startZ + 22500}px)`,
                ease: 'none',
                duration: sequenceDuration,
            }, 0);
        });
        tl.to(containerRef.current, {
            backgroundColor: '#F7F8F3',
            ease: 'power1.inOut',
            duration: 1
        });

        return () => {
            generatedStars.forEach((star) => star.element.remove());
        };
    }, { scope: containerRef, dependencies: [isMobile] });

    /* ---------- MOBILE: static 2x2 grid ---------- */
    if (isMobile) {
        return (
            <div id="statistics" ref={containerRef} className="stats-mobile">
                <div className="stats-mobile-intro">
                    <p className="stats-mobile-title">Explore endless opportunities</p>
                    <p className="stats-mobile-lead">
                        Our organization mitigates the engagement gap by serving as Gwinnett County's resource hub, providing a centralized database of local organizations so you can see the value of your time in the community.
                    </p>
                </div>

                <div className="stats-grid">
                    {statistics.map((i) => (
                        <div key={i.id} className="stats-card">
                            {i.id == 1 && <InteractivePieChart />}
                            {i.id == 2 && <SimpleChart />}
                            <div className="heading">{i.top}</div>
                            <div className="subtitle">{i.sub}</div>
                            <hr className="my-2" />
                            <div className="description">{i.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ---------- DESKTOP: scroll experience ---------- */
    return (
        <div id="statistics" ref={containerRef}>
            <div className="scroll-track">
                <div
                    className="threeD-screen"
                    style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
                >
                    <div ref={starFieldRef} className="starfield" style={{ transformStyle: 'preserve-3d' }} />

                    <div className="wordSection flex !flex-col !w-3/4 gap-2 items-center justify-center absolute top-20 left-1/2 -translate-x-1/2">
                        <p className="text-7xl">
                            Explore endless opportunities
                        </p>
                        <p className="text-center">
                            Our organization mitigates the engagement gap by serving as Gwinnett County's resource hub. We encourage community members to reverse Georgia's low volunteer rates by providing a centralized database of local organizations and to inspire individuals to see the value of their time in the community
                        </p>
                    </div>
                    {statistics.map((i) => (
                        <div
                            key={i.id}
                            className={clsx('wordSection', {'-translate-x-full -translate-y-1/2': i.id % 2 !== 0, 'translate-x-full translate-y-1/2':  i.id % 2 === 0,})}
                            style={{ transformStyle: 'preserve-3d', }}
                        >
                            {i.id == 1 && (<InteractivePieChart/>)  }
                            {i.id == 2 && (<SimpleChart/>)  }
                            <div>
                                <div className="heading">{i.top}</div>
                                <div className="subtitle">{i.sub}</div>
                                <hr className="my-2" />
                                <div className="description">{i.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Statistics;