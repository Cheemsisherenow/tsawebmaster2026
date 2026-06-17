import React from 'react'
import { pageNavigation } from '../store'
import { headerLinks } from '../constants'

function Header() {

    const changeCurrentPage = pageNavigation((state) => state.changeCurrentPage)
    return (
        <header>
            <nav>
                <div className = "logo">
                    <img/>
                    <p> VolunteerGwinnett</p>
                </div>
                <ul>
                    {headerLinks.map((link) => (
                        <li key = {link.label}>
                            <button onClick = {() => changeCurrentPage(link.label) }>
                                {link.label}
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick = {() => changeCurrentPage("Get Involved")}>
                    Get Involved
                </button>
            </nav>
        </header>
    )
}

export default Header
