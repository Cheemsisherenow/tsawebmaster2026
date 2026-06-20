import React from 'react'
import { pageNavigation } from '../store'
import { headerLinks } from '../constants'

const Footer = () => {
    const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage)
  return (
    <footer className="bg-[#286A6C] text-white px-[4vw] pb-[4vh]">
        <div className="flex flex-row justify-between py-[8vh]">
            <div className="w-[40%] flex flex-col items-start gap-8 ">
                <div className="flex flex-col gap-4">
                    <p className="text-3xl">
                        VolunteerGwinnett
                    </p>
                    <p className="text-lg">
                        The Gwinnett County’s Community Resource Hub. Scroll through volunteer opportunities and community resources that actually fit your life, with no pressure, just options to get involved when you want.
                    </p>
                </div>
                <button className="border border-white text-2xl text-white rounded-xl py-3 px-6">
                    Go Back to the Top
                </button>
            </div>
            <div className="flex flex-col item-start text-xl gap-4 -translate-x-1/2">
                <p className="text-2xl">
                    Navigation
                </p>
                <ul className="flex flex-col items-start gap-2">
                    {headerLinks.map((link) => (
                        <li key = {link.label}>
                            <button onClick = {() => changeCurrentPage(link.label) }>
                                    {link.label}
                            </button>
                        </li>
                    ))}
                </ul>
                
            </div>
        </div>
        <hr className="h-2"/>
        <div>
            <p>
                VolunteerGwinnet. All rights reserved.
            </p>
        </div>
        

    </footer>
  )
}

export default Footer
