import React from 'react'
import { useState, useEffect } from 'react'

const Resource_Hub = () => {

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://volunteer-api-x37c.onrender.com/api/opportunities';

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();


        setEvents(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch opportunities:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Fetching upcoming opportunities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h3>Oops! We couldn't load the events.</h3>
          <p>Make sure your backend API is running and the API_URL in the code is correct.</p>
          <p>Error details: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container, mt-[18vh]" >
      <div id="events-grid">

        {events.map((event) => {

          const dateObj = new Date(event.event_date);
          dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (

            <div className="card" key={event.id}>
              <img
                src={event.img_url}
                alt={event.title}
                className="card-img"
                onError={(e) => e.target.src = 'https://placehold.co/800x500/e2e8f0/475569?text=zihongs+big+butt+'}
              />
              <div className="card-content">
                <div className="card-header">
                  <h2 className="card-title">title : {event.title}</h2>
                  <span className="tag">category : {event.tag}</span>
                </div>
                <div className="org-name">organization : {event.org}</div>

                <div className="card-details">
                  <p>location : {event.location}</p>
                </div>

                <p className="description">description : {event.description}</p>


              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Resource_Hub
