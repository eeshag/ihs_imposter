import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoPage.css';

function InfoPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="info-page">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <div className="info-content">
        <h1 className="info-title">About Blue Crew Imposter</h1>
        
        <section className="info-section">
          <h2 className="section-title">🎮 How to Play</h2>
          <ol className="info-list">
            <li>One player creates a game and becomes the <strong>host</strong>.</li>
            <li>The host shares a <strong>game code</strong> (or link) with the group.</li>
            <li>Players join on their own phones or computers.</li>
            <li>Each player receives:
              <ul className="info-sublist">
                <li>the <strong>actual word</strong>, or</li>
                <li>a <strong>1-word hint</strong> (making them an imposter).</li>
              </ul>
            </li>
            <li>The app randomly selects a player to go first.</li>
            <li>Players take turns <strong>clockwise</strong>, describing the word creatively.</li>
            <li>Imposters try to blend in without knowing the word.</li>
            <li>At the end of the round, players <strong>vote</strong> for who they think the imposter is.</li>
          </ol>
        </section>

        <section className="info-section">
          <h2 className="section-title">👥 Players & Roles</h2>
          <ul className="info-list">
            <li><strong>Minimum players:</strong> 3</li>
            <li><strong>Maximum players:</strong> 12</li>
            <li><strong>Number of imposters:</strong> Configurable (as long as there is at least one non-imposter)</li>
          </ul>
        </section>

        <section className="info-section">
          <h2 className="section-title">🎯 Why This Project Exists</h2>
          <p className="info-text">
            I wanted to:
          </p>
          <ul className="info-list">
            <li>Make Imposter playable <strong>online</strong></li>
            <li>Add a <strong>school-specific twist</strong> using IHS-related words</li>
            <li>Learn more about <strong>full-stack development</strong>, especially backend systems</li>
          </ul>
          <p className="info-text">
            Blue Crew Imposter is a web-based version of the popular <strong>Imposter</strong> game, 
            customized for <strong>IHS</strong> and designed to work <strong>online</strong>.  
            Unlike most existing Imposter apps that require passing around one physical phone, 
            this version allows <strong>everyone to play on their own device</strong> using a shared game code.
          </p>
          <p className="info-text">
            The game keeps the <strong>original gameplay</strong> but adds a <strong>school-themed twist</strong> using <strong>IHS-related words</strong>.
          </p>
          <p className="info-text">
            This project is both a <strong>fun game</strong> and a way for me to get more <strong>real coding experience</strong>.
          </p>
        </section>
        
        <div className="info-image-container">
          <img 
            src="/Blue_1.jpg" 
            alt="Blue Crew Imposter Character" 
            className="info-image"
          />
        </div>
      </div>
    </div>
  );
}

export default InfoPage;

