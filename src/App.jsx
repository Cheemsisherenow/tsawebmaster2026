import React from 'react'
import Header from './components/Header'
import { pageNavigation } from "./store"
import Home from './components/Home';
import Resource_Hub from './components/Resource_Hub';
import Discover from './components/Swiping';
import Submit_Resources from './components/SubmitResources';
import Footer from './components/Footer';
import Get_Involved from './components/Get_Involved';
import Saved_Resources from './components/Saved_Resources';
import Reference from './components/References';
function App() {
  const currentPage = pageNavigation((state) => (state.currentPage));
  if (typeof window !== 'undefined') {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
}

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home />;
      case 'Resource Hub':
        return <Resource_Hub />;
      case 'Match Me':
        return <Discover />;
      case 'Submit Resources':
        return <Submit_Resources />;
      case "Saved Resources":
        return <Saved_Resources/>
      case "Reference Page":
        return <Reference/>
      case 'Get Involved':
          return <Get_Involved />;
      default:
        return <Home />;
    }
  };

  
  return (
    <div>
      <Header/>
      {renderPage()}
      <Footer/>
    </div>
  )
}

export default App
