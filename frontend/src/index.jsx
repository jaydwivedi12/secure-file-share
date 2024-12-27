import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router";
import './index.css';
import App from './App';
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
    <ToastContainer position="top-right" autoClose={1000} limit={0} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark"/>
</BrowserRouter>
);
