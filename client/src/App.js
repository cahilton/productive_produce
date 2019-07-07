import React from 'react';
import logo from './fruits.png';
import './App.css';
import Home from './Home';

// https://bulma.io/documentation/elements/

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h3>Productive Produce</h3>
      </header>
        <section className="section">
            <Home/>
        </section>


    </div>
  );
}

export default App;
