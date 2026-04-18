# Dev.to Clone

A feature-rich clone of the [Dev.to](https://dev.to) developer community platform, built with **Angular 19** and **Tailwind CSS 4**. It integrates with the official Dev.to API to fetch real articles, tags, and user data.

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 📰 **Home Feed** — Browse the latest articles fetched from the Dev.to API
- 📖 **Post Detail** — Full article view with reading time and reaction counts
- 👤 **User Profiles** — View any developer's profile and their published articles
- ✍️ **Create Post** — Write and publish new blog posts (authenticated)
- 🔖 **Reading List** — Save articles to your personal reading list
- 🏷️ **Tags** — Browse articles by tags/topics
- 📋 **Listings** — Community job listings and classifieds
- 🎙️ **Podcasts** — Discover developer podcasts
- 🎥 **Videos** — Watch developer video content
- ⚙️ **Settings** — Manage account settings and API configuration
- 🔐 **Authentication** — Login, register, forgot password, and reset password flows
- 🌙 **Dark / Light Mode** — Full theme toggle support
- 📱 **Responsive Design** — Mobile-first, fully responsive layout

---

## 🛠️ Tech Stack

| Technology                                          | Version | Purpose                    |
| --------------------------------------------------- | ------- | -------------------------- |
| [Angular](https://angular.io/)                      | 19.x    | Frontend framework         |
| [TypeScript](https://www.typescriptlang.org/)       | 5.8.x   | Type-safe JavaScript       |
| [Tailwind CSS](https://tailwindcss.com/)            | 4.2.x   | Utility-first CSS styling  |
| [RxJS](https://rxjs.dev/)                           | 7.8.x   | Reactive programming       |
| [Dev.to API](https://developers.forem.com/api/)     | v1      | Articles, users & tag data |
| [Karma + Jasmine](https://karma-runner.github.io/)  | -       | Unit testing               |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── core/                   # Singleton services & guards
│   │   ├── auth.service.ts     # Authentication logic
│   │   ├── auth.guard.ts       # Route protection
│   │   ├── api-config.service.ts # API key & URL configuration
│   │   └── header/             # App header component
│   ├── models/                 # TypeScript interfaces
│   │   ├── post.interface.ts
│   │   ├── user.interface.ts
│   │   └── comment.interface.ts
│   ├── pages/                  # Route-level page components
│   │   ├── home/               # Home feed
│   │   ├── post-detail/        # Article detail page
│   │   ├── profile/            # User profile page
│   │   ├── create-post/        # New post editor
│   │   ├── reading-list/       # Saved articles
│   │   ├── tags/               # Tags browser
│   │   ├── listings/           # Job listings
│   │   ├── podcasts/           # Podcasts page
│   │   ├── videos/             # Videos page
│   │   ├── settings/           # Account settings
│   │   ├── about/              # About page
│   │   ├── not-found/          # 404 page
│   │   └── auth/               # Authentication pages
│   │       ├── login/
│   │       ├── register/
│   │       ├── forgot-password/
│   │       └── reset-password/
│   └── shared/                 # Reusable components & services
│       ├── data.service.ts     # Dev.to API data fetching
│       ├── theme.service.ts    # Dark/light mode toggle
│       └── post-card/          # Reusable post card component
├── environments/               # Environment configuration
└── styles.scss                 # Global styles
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [npm](https://www.npmjs.com/) v10 or higher
- [Angular CLI](https://angular.io/cli) v19

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/manthanank/dev-to-clone-app.git
   cd dev-to-clone-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure the environment** *(optional)*

   To use the Dev.to API with your own API key, update `src/environments/environment.ts`:

   ```ts
   export const environment = {
     production: false,
     apiUrl: 'https://dev.to/api',
     apiKey: 'YOUR_DEV_TO_API_KEY' // optional
   };
   ```

   > You can also set the API key at runtime via the **Settings** page in the app.

4. **Start the development server**

   ```bash
   npm start
   ```

   Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

---

## 📜 Available Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm start`       | Run the development server at `localhost:4200`   |
| `npm run build`   | Build the production bundle to `dist/`           |
| `npm run watch`   | Build in development watch mode                  |
| `npm test`        | Run unit tests via Karma                         |

---

## 🔌 Dev.to API Integration

This app uses the [Forem API v1](https://developers.forem.com/api/) (Dev.to's public API) to fetch real content.

- **Articles** — Fetched via `GET /articles`
- **Article Detail** — Fetched via `GET /articles/{id}`
- **User Profile** — Fetched via `GET /users/{username}`
- **Tags** — Fetched via `GET /tags`
- **Authenticated User** — Fetched via `GET /users/me` (requires API key)

A CORS proxy is configured in `proxy.conf.json` for local development.

---

## 🔐 Authentication

Authentication is simulated locally and supports:

- **Email/Password Login** — Creates a local session stored in `localStorage`
- **Registration** — Registers a new user profile locally
- **API Key Login** — Provide a Dev.to API key to authenticate as your real Dev.to account
- **Forgot / Reset Password** — Simulated password reset flow
- **Auth Guard** — Protects the `/new` (Create Post) route from unauthenticated access

---

## 🗺️ Routes

| Path                | Page            | Protected |
| ------------------- | --------------- | --------- |
| `/`                 | Home Feed       | No        |
| `/post/:id`         | Post Detail     | No        |
| `/user/:username`   | User Profile    | No        |
| `/new`              | Create Post     | ✅ Yes    |
| `/reading-list`     | Reading List    | No        |
| `/tags`             | Tags            | No        |
| `/about`            | About           | No        |
| `/settings`         | Settings        | No        |
| `/listings`         | Listings        | No        |
| `/podcasts`         | Podcasts        | No        |
| `/videos`           | Videos          | No        |
| `/login`            | Login           | No        |
| `/register`         | Register        | No        |
| `/forgot-password`  | Forgot Password | No        |
| `/reset-password`   | Reset Password  | No        |
| `/**`               | 404 Not Found   | No        |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Dev.to](https://dev.to) — For the inspiration and their public API
- [Forem](https://www.forem.com/) — The open-source platform behind Dev.to
- [Angular Team](https://angular.io/) — For the excellent framework
