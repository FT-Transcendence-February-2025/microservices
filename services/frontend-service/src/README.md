# Frontend Project

This project is a front-end application built using Vanilla JavaScript, TypeScript, and styled with Tailwind CSS. It includes forms for user authentication, such as login, registration, and password change, and is set up to run with Docker and Traefik as a reverse proxy.

## Project Structure

```
frontend-project
├── public
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── password-change.html
├── src
│   ├── app.ts
│   ├── forms
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── password-change.ts
│   └── styles
│       └── tailwind.css
├── traefik
│   └── traefik.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd frontend-project
   ```

2. **Install dependencies:**
   Make sure you have Node.js and npm installed. Then run:
   ```
   npm install
   ```

3. **Build the project:**
   To compile TypeScript and generate the necessary files, run:
   ```
   npm run build
   ```

4. **Run the application with Docker:**
   Ensure Docker is installed and running, then execute:
   ```
   docker-compose up --build
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:80` to view the application.

## Usage

- **Login:** Navigate to the login page to authenticate users.
- **Register:** Users can create a new account through the registration form.
- **Change Password:** Existing users can change their passwords using the password change form.

## Technologies Used

- Vanilla JavaScript
- TypeScript
- Tailwind CSS
- Docker
- Traefik

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.