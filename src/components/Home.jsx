import React from 'react'
import { pageNavigation } from '../store'
import FinalSphere from './Globe/FinalSphere'

const Home = () => {
    const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage)
    return (
        <section id = "landing">
        <div className="w-[45%]">
            <div className = "text-body">
                <div className = "wrapper">
                    <p className="text-2xl">
                        | Gwinnett County, GA
                    </p>
                    <p className="text-7xl leading-[1.2]">
                        Find your way into the <span className="text-[#286A6C]">community</span> 
                    </p>
                </div>
                <p className = "text-3xl my-8 leading-relaxed">
                    The Gwinnett County’s Community Resource Hub. Scroll through volunteer opportunities and community resources that actually fit your life, with no pressure, just options to get involved when you want.
                </p>
            </div>
            <button onClick = {() => changeCurrentPage("Resource Hub")}>
                Start Exploring
                <img/>
            </button>
        </div>
        <div className='flex w-[45%] h-3/4 items-center'>
            <FinalSphere/>
        </div>
        </section>
    )
}

export default Home
