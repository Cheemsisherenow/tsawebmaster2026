import React, { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { statistics } from '../constants';
import clsx from 'clsx';
import InteractivePieChart from './Diagrams/InteractivePieChart';
import SimpleChart from './Diagrams/InteractiveBar';

gsap.registerPlugin(ScrollTrigger);

const Statistics = ({ sphereRef }) => {
    const containerRef   = useRef(null);
    const starFieldRef   = useRef(null);
    const placeholderRef = useRef(null);
    const numStars = 300;

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        const el = sphereRef?.current;
        if (!el) return;

        let st = null;

        requestAnimationFrame(() => {
            const rect      = el.getBoundingClientRect();
            const leftOffset = window.innerHeight * 0.04;
            const initialX  = rect.left - leftOffset;

            gsap.set(el, {
                position: 'fixed',
                top: 0, left: 0,
                x: initialX,
                y: rect.top,
                width:  rect.width,
                height: rect.height,
                margin: 0,
                transformOrigin: 'top left',
                zIndex: 5,
            });

            const targetX = (window.innerWidth  - rect.width)  / 2;
            const targetY = (window.innerHeight - rect.height) / 2;

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
    }, [sphereRef]);

    useGSAP(() => {
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
            },
        });

        tl.to(containerRef.current, {
            backgroundColor: '#020204',
            ease: 'power1.out',
            duration: 0.5,
        }, 0);

        const cards = gsap.utils.toArray('.card', containerRef.current);
        cards.forEach((card, index) => {
            tl.fromTo(card,
                { z: -3000, opacity: 0, rotateX: 35, rotateY: index % 2 === 0 ? -25 : 25 },
                { z: 0, opacity: 1, rotateX: 0, rotateY: 0, ease: 'power2.out', duration: 1 },
                index === 0 ? 0.1 : '+=0.2'
            )
            .to(card, { z: 2000, opacity: 0, ease: 'power2.in', duration: 1 }, '+=0.5');
        });

        const sequenceDuration = tl.duration();

        generatedStars.forEach((star) => {
            tl.to(star.element, {
                transform: `translate(-50%, -50%) rotate(${star.rotation}deg) translate3d(${star.radius}px, 0px, ${star.startZ + 22500}px)`,
                ease: 'none',
                duration: sequenceDuration,
            }, 0);
        });

        return () => {
            generatedStars.forEach((star) => star.element.remove());
        };
    }, { scope: containerRef });

    return (
        <div id="statistics" ref={containerRef}>
            <div className="scroll-track">
                <div
                    className="threeD-screen"
                    style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
                >
                    <div ref={starFieldRef} className="starfield" style={{ transformStyle: 'preserve-3d' }} />

                    <div
                        ref={placeholderRef}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 w-1/3 aspect-square"
                        style={{ transformStyle: 'preserve-3d' }}
                    />

                    {statistics.map((i) => (
                        <div
                            key={i.id}
                            className={clsx('card flex flex-row absolute w-1/3 p-4 z-50', {
                                '-translate-x-3/4 -translate-y-1/2': i.id % 2 !== 0,
                                'translate-x-3/4 translate-y-1/2':  i.id % 2 === 0,
                            })}
                            style={{ transformStyle: 'preserve-3d', }}
                        >
                            {i.id == 1 && (<InteractivePieChart/>)  }
                            {i.id == 2 && (<SimpleChart/>)  }
                            <div>
                                
                                <div className="text-5xl font-black text-white">{i.top}</div>
                                <div className="text-xl text-white/80 font-medium">{i.sub}</div>
                                <hr className="my-2" />
                                <div className="text-xl text-white/80 font-medium">{i.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Statistics;