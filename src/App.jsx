// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import Flow from './pages/Flow';
import Metrics from './pages/Metrics';
import Home from './pages/Home';
import './App.css';
import DataLab from "./pages/DataLab.jsx";

function App() {
    useEffect(() => {
        // Устанавливаем масштаб 110% при загрузке страницы
        const setScale = () => {
            document.body.style.zoom = "100%";
        };

        // Применить масштаб при загрузке
        window.onload = setScale;

        // Убираем эффект при размонтировании
        return () => {
            window.onload = null;
        };
    }, []);

    return (
        <Router>
            <div className="App">
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Flow />} />
                        <Route path="/signin" element={<Login />} />
                        <Route path="/signup" element={<Register />} />
                        <Route path="/flow" element={<Flow />} />
                        <Route path="/metrics/*" element={<Metrics />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/datalab" element={<DataLab />} />
                    </Routes>
                </main>
            </div>
            <Footer />
        </Router>
    );
}

export default App;
