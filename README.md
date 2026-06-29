<div align="center">
	<h3 align="center">Scrape Essentials</h3>
	<p>A modern web scraping toolkit built with TypeScript, React, and Turborepo. Features a browser extension for scraping management, server backend, and configurable rules for various websites.</p>
	<div>
		<img src="https://img.shields.io/badge/-Turborepo-FF1E56?logo=turborepo&logoColor=white" alt="Turborepo">
		<img src="https://img.shields.io/badge/-Typescript-3178C6?logo=typescript&logoColor=white" alt="Typescript">
		<img src="https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black" alt="React">
		<img src="https://img.shields.io/badge/-Hono-E36002?logo=hono&logoColor=white" alt="Express">
		<img src="https://img.shields.io/badge/-WXT-67D55E?logo=wxt&logoColor=white" alt="WXT">
		<img src="https://img.shields.io/badge/-Biome-60A5FA?logo=biome&logoColor=white" alt="Biome">
		<img src="https://img.shields.io/badge/-Cloudflare Workers-F38020?logo=cloudflareworkers&logoColor=white" alt="Cloudflare Workers">
		<img src="https://img.shields.io/badge/-Bun-000000?logo=bun&logoColor=white" alt="Bun">
	</div>
</div>

---

### 🚀 Features

- Browser extension for scraping management and control
- Configurable scraping rules for various websites
- Server backend for data processing and storage
- Support for multiple content sites (manga, anime, novels, etc.)
- End-to-end type safety with TypeScript and Zod

### 🔨 Installation Guide

Follow these steps to install and use the application.

**Requirements**

Software:

- [Node.js](https://nodejs.org/en/download) (version 20.10.0 or higher)
- [Bun](https://bun.sh/) (version 1.3.9)

Hardware:

- RAM: 4GB or higher
- CPU: Any modern processor

**Preparation**

- Clone this repository and install dependencies:
	```bash
	git clone https://github.com/hdkhanh462/scrape-essentials.git
	cd scrape-essentials
	bun install
	```
- Update environment variables in `.env` files as needed (check packages/env for details)

**Running the App**

- Start the development server for all apps:
	```bash
	bun run dev
	```
- For server only:
	```bash
	bun run dev:server
	```
- Build for production:
	```bash
	bun run build
	```