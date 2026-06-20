import {React, useState, useRef} from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { pageNavigation } from '../store'

const Highlight = () => {
    const componentRef = useRef(null);
    const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage)
    
    useGSAP(() => {
        const blocks = gsap.utils.toArray('.block', componentRef.current);
        let currentActiveBlock = blocks[0];
        // initial state
        blocks.forEach((b) => {
            gsap.set(b, { flexGrow: .8 });
            gsap.set(b.querySelector('.inner_view'), { opacity: 0 });
            gsap.set(b.querySelector('.outer_view'), { opacity: 1 });
        });
    
        const apply = (active) => {
            blocks.forEach((b) => {
                const on = b === active;
                // width: all blocks animate together, same duration + ease
                gsap.to(b, { flexGrow: on ? 3 : .8, duration: 1, ease: 'power3.out', overwrite: 'auto' });
                // crossfade, independent of the width tween
                gsap.to(b.querySelector('.outer_view'), { opacity: on ? 0 : 1, duration: 0, overwrite: 'auto' });
                gsap.to(b.querySelector('.inner_view'), { opacity: on ? 1 : 0, duration: on ? 0.6 : 0.3, overwrite: 'auto' });
            });
        };
        if (currentActiveBlock) {
            apply(currentActiveBlock);
        }
    
        blocks.forEach((b) => b.addEventListener('mouseenter', () => apply(b)));
         // reset when leaving the row
    }, []);
  return (
    <section id="highlights" ref={componentRef}>
        <div className="flex flex-col items-center">
            <p className="text-7xl text-[#286A6C]">
                Highlighted Resources
            </p>
            <p className="text-3xl">
                The ones making the biggest differences in Gwinnett
            </p>
        </div>
        <div className="block_container">
            <div className="block">
                <div className="outer_view">
                    <div className="upper_line"/>
                    <div className="lower_line"/>
                        <p className="title">
                            Keep Gwinnett Beautiful
                        </p>
                </div>
                <div className="inner_view">
                    <div className ="inner_container">
                        <div className="header_container">
                            <p className="tag">
                                Environmental
                            </p>
                            <p className ="title">
                                Keep Gwinnett Beautiful
                            </p>
                        </div>
                        <p className="description">
                            Beautifying parks, waterways, and neighborhoods through volunteer cleanups, tree plantings, and environmental education. Zero cost to join.
                        </p>
                        
                    </div>
                    <button>
                            Learn More
                    </button>
                </div>
            </div>
            <div className="block">
                <div className="outer_view">
                    <div className="upper_line"/>
                    <div className="lower_line"/>
                        <p className="title">
                            Keep Gwinnett Beautiful
                        </p>
                </div>
                <div className="inner_view">
                    <div className ="inner_container">
                        <div className="header_container">
                            <p className="tag">
                                Environmental
                            </p>
                            <p className ="title">
                                Keep Gwinnett Beautiful
                            </p>
                        </div>
                        <p className="description">
                            Beautifying parks, waterways, and neighborhoods through volunteer cleanups, tree plantings, and environmental education. Zero cost to join.
                        </p>
                        
                    </div>
                    <button>
                            Learn More
                    </button>
                </div>
            </div>
            <div className="block">
                <div className="outer_view">
                    <div className="upper_line"/>
                    <div className="lower_line"/>
                        <p className="title">
                            Keep Gwinnett Beautiful
                        </p>
                </div>
                <div className="inner_view">
                    <div className ="inner_container">
                        <div className="header_container">
                            <p className="tag">
                                Environmental
                            </p>
                            <p className ="title">
                                Keep Gwinnett Beautiful
                            </p>
                        </div>
                        <p className="description">
                            Beautifying parks, waterways, and neighborhoods through volunteer cleanups, tree plantings, and environmental education. Zero cost to join.
                        </p>
                        
                    </div>
                    <button>
                            Learn More
                    </button>
                </div>
            </div>
        </div>
        <div className="w-full">
            <button onClick = {() => changeCurrentPage("Resource Hub")}>
                Start Discovering
            </button>
        </div>
    </section>
  )
}

export default Highlight
