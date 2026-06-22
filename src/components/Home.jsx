import React, { useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { pageNavigation } from '../store'
import FinalSphere from './Globe/FinalSphere'
import Statistics from './Statistics'
import Highlight from './Highlight'
import Location from './Location'
import ExpandedCard from './Globe/ExpandedCard'

const Home = () => {
  const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage)
  const sphereRef = useRef(null)
  const [expanded, setExpanded] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div>
      <section id="landing">
        <div className="w-full md:w-[45%]">
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
            <img />
          </button>
        </div>

        {!isMobile && (
          <div ref={sphereRef} className="sphereBox">
            <FinalSphere onSelect={setExpanded} />
          </div>
        )}
      </section>

      <Statistics sphereRef={sphereRef} />
      <Highlight />
      <Location />
      <ExpandedCard card={expanded} onClose={() => setExpanded(null)} />
    </div>
  )
}

export default Home