import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from './ArticleCard'; // Import the ArticleCard component
import './styles/TopMenu.css';

const TopMenu = () => {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [cards, setCards] = useState([]);

  const handleLogout = () => {
    console.log('Logout clicked');
    // Clear any authentication tokens or session data
    localStorage.removeItem('authToken'); // Replace 'authToken' with your actual token key
    sessionStorage.removeItem('authToken'); // If you use sessionStorage

    // Optionally clear other user-specific data
    localStorage.removeItem('user'); // Replace 'user' with your actual user data key

    // Redirect to the login page or home page
    navigate('/login'); // Adjust the path as necessary
  };

  const toggleWeather = async () => {
    const existingWeatherCardIndex = cards.findIndex(card => card.url === 'weather');

    if (!weatherData && !loading && !error) {
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/weather/Chicago/`;
      console.log('API Endpoint:', endpoint); // Log the endpoint to console

      try {
        setLoading(true);
        const response = await axios.get(endpoint);
        if (response.status === 200) {
          console.log('Weather Data:', response.data); // Log the weather data
          setWeatherData(response.data);
          if (existingWeatherCardIndex === -1) {
            addWeatherCard(response.data);
          } else {
            updateWeatherCard(response.data, existingWeatherCardIndex);
          }
        } else {
          console.error('Failed to fetch weather data:', response.statusText);
          setError(true);
        }
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    } else if (existingWeatherCardIndex === -1) {
      addWeatherCard(weatherData);
    }
  };

  const addWeatherCard = (data) => {
    const article = {
      title: `Weather in ${data.city}, ${data.country}`,
      content: `Description: ${data.description}\nTemperature: ${data.temperature} °C\nHumidity: ${data.humidity}%\nWind Speed: ${data.wind_speed} m/s`,
      url: 'weather', 
      position: { x: 0, y: 0 }
    };
    setCards(prevCards => [...prevCards, { ...article, id: new Date().getTime() }]);
  };

  const updateWeatherCard = (data, index) => {
    const updatedCards = [...cards];
    updatedCards[index] = {
      ...updatedCards[index],
      title: `Weather in ${data.city}, ${data.country}`,
      content: `Description: ${data.description}\nTemperature: ${data.temperature} °C\nHumidity: ${data.humidity}%\nWind Speed: ${data.wind_speed} m/s`
    };
    setCards(updatedCards);
  };

  const handleRemoveCard = (url) => {
    setCards(prevCards => prevCards.filter(card => card.url !== url));
  };

  const handleUpdatePosition = (url, position) => {
    setCards(prevCards => prevCards.map(card => (card.url === url ? { ...card, position } : card)));
  };

  return (
    <div className="top-menu">
      <div className="logo">
        <img src="/images/logo.png" alt="Logo" />
        <span>NewsFling</span>
      </div>
      <nav className="nav-links">
        <button className="nav-link" onClick={toggleWeather}>Weather</button>
        <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
      </nav>
      <div className="profile">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <div className="cards-container">
        {cards.map(card => (
          <ArticleCard
            key={card.id}
            article={card}
            onRemove={handleRemoveCard}
            onUpdatePosition={handleUpdatePosition}
            isWeatherCard={card.url === 'weather'} // Pass the isWeatherCard prop
          />
        ))}
      </div>
    </div>
  );
};

export default TopMenu;
