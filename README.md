# Screenlite Player Web

An open-source, web-based digital signage player.

Built with **Vite**, **React**, and **TypeScript**.

## Getting Started

1. **Clone the repository:**
	```bash
	git clone https://github.com/screenlite/web-player.git
	cd web-player
	```

2. **Install dependencies:**
	```bash
	npm install
	```

3. **Start the development server:**
	```bash
	npm run dev
	```

## Supported Data Sources

- **Network JSON file**
- **[Screenlite CMS](https://github.com/screenlite/screenlite)** _(Work in Progress)_
- **[Garlic-Hub CMS](https://github.com/sagiadinos/garlic-hub)** _(Work in Progress)_

## Notes

- If you encounter CORS errors, you can launch Chrome with web security disabled:

	**On Linux/macOS:**
	```bash
	chrome --disable-web-security --user-data-dir="/tmp/chrome"
	```

	**On Windows:**
	```powershell
	start chrome --disable-web-security --user-data-dir="C:\chrome-dev"
	```
- This project is tested and intended for use in **Google Chrome** only.
