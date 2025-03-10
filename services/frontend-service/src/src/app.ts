// src/app.ts
import './styles/tailwind.css';
import { initializeForms } from './forms/login';
import { initializeRegistration } from './forms/register';
import { initializePasswordChange } from './forms/password-change';

const initApp = () => {
    initializeForms();
    initializeRegistration();
    initializePasswordChange();
};

document.addEventListener('DOMContentLoaded', initApp);