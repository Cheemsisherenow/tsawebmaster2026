import {React, useState, useRef} from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Highlight = () => {
    const [active, setActive] = useState(null);
    const componentRef = useRef(null);
    useGSAP(() => {
        
        const blocks = gsap.utils.toArray('.block', componentRef.current);

        blocks.forEach((block) => {
            const outer_view = block.querySelector('.outer_view');
            const inner_view = block.querySelector('.inner_view');

            const tl = gsap.timeline({ 
                paused: true,
                overwrite: 'auto'
            });

            tl.to(block, {
                width: '50vw',
              duration: 0.3,
              overwrite: 'auto' 
            }, "<");

            tl.to(outer_view, {
                opacity: 0,
                duration: 0.2,
                
            })

            tl.to(inner_view, {
                opacity: 1,
                duration: 0.2,
                
            })
          
            block._hoverAnim = tl;
          
            block.addEventListener('mouseenter', () => {
              blocks.forEach((b) => {
                if (b === block) {
                  b._hoverAnim.play(); 
                } else {
                  b._hoverAnim.reverse(); 
                }
              });
            });
          });
    },[])
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
        <div className="container">
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
    </section>
  )
}

export default Highlight
