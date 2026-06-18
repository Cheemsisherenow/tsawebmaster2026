import React from 'react'
import Header from './components/Header'
import { pageNavigation } from "./store"
import Home from './components/Home';
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
        return <Match_Me />;
      case 'Submit Resources':
        return <Submit_Resources />;
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
    </div>
  )
}

export default App
