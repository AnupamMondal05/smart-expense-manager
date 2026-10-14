import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import './index.css';

const savedTheme = localStorage.getItem('expense-theme');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDarkMode);

document.documentElement.classList.toggle('dark', isDarkMode);
document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
