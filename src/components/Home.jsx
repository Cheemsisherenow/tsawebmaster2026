import { React, useRef } from 'react'
import { pageNavigation } from '../store'
import FinalSphere from './Globe/FinalSphere'
import Statistics from './Statistics'
import Highlight from './Highlight'
import Location from './Location'

const Home = () => {
    const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage)
    const sphereRef = useRef(null)

    return (
        <div>

            <section id="landing">
                <div className="w-[45%]">
                    <div className="text-body">
                        <div className="wrapper">
                            <p className="location">| Gwinnett County, GA</p>
                            <p className="heading">
                                Find your way into the <span className="text-[#286A6C]">community</span>
                            </p>
                        </div>
                        <p className="description">
                        The Gwinnett County’s Community Resource Hub. Scroll through volunteer opportunities and community resources that actually fit your life, with no pressure, just options to get involved when you want.
                        </p>
                    </div>
                    <button onClick={() => changeCurrentPage("Resource Hub")}>
                        Start Exploring
                        <img/>
                    </button>
                </div>

                <div ref={sphereRef} className='sphereBox'>
                    <FinalSphere />
                </div>
            </section>

            <Statistics sphereRef={sphereRef} />
            <Highlight />
            <Location/>
        </div>
    )
}

export default Home