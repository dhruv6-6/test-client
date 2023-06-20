import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Join from './component/Join';
import Call from './component/Call';
import './App.css';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Join />} />
          <Route path="/call" element={<Call />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;