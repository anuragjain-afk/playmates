
<br/>

```
██████╗ ██╗      █████╗ ██╗   ██╗███╗   ███╗ █████╗ ████████╗███████╗███████╗
██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝████╗ ████║██╔══██╗╚══██╔══╝██╔════╝██╔════╝
██████╔╝██║     ███████║ ╚████╔╝ ██╔████╔██║███████║   ██║   █████╗  ███████╗
██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██║╚██╔╝██║██╔══██║   ██║   ██╔══╝  ╚════██║
██║     ███████╗██║  ██║   ██║   ██║ ╚═╝ ██║██║  ██║   ██║   ███████╗███████║
╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝
```

### Real-time multiplayer browser games. No downloads. No accounts. Just play.
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=200&section=header&text=Playmates&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Real-time%20multiplayer%20browser%20games&descAlignY=58&descSize=20&animation=fadeIn" width="100%"/>

<br/>

[![MIT License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-white?style=for-the-badge&logo=socket.io&logoColor=black)](https://socket.io)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![MIT License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge&logoColor=white)](#)
[![Made with React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](#)
[![Powered by Socket.io](https://img.shields.io/badge/Socket.io-Live-white?style=for-the-badge&logo=socket.io&logoColor=black)](#)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js)](#)

<br/>

[**🚀 Play Now**](#-quick-start) · [**📖 How It Works**](#-how-it-works) · [**🎮 Games**](#-games) · [**🏗️ Architecture**](#️-architecture) · [**🌍 Deploy**](#-deployment)
### 🎮 Open a link. Share a code. Play instantly.
### No downloads. No accounts. No friction.

<br/>

---

</div>

## 🔥 What Makes Playmates Different

> Most browser games still ask you to **download an app**, **create an account**, or **pay a subscription** before you even see the game. Playmates throws all of that away.

Open a URL. Share a code. Play in **under 10 seconds.**
---

<br/>

<table>
<tr>
<td width="50%">

### 💻 Mode 1 — Two Devices
Each player opens Playmates on their **own device**. One person creates a room and shares a **5-letter code**. The other types it in. Game starts instantly — no account, no lobby, no wait.

**Perfect for:** Playing with a friend across the internet
## ✨ The Idea

</td>
<td width="50%">
> Most multiplayer games make you jump through hoops before you even start — download this, create an account, pay for a subscription. By then, the urge to play is gone.
>
> **Playmates skips all of that.**

### 📱 Mode 2 — Split Screen
One laptop. The screen splits in **two halves**. Each half shows a QR code. Players scan with their phones — phones become **wireless game controllers**. No app download, works in any browser.
You open a URL. Your friend opens a URL. You share a 5-letter code. You're playing a live real-time game together in **under 10 seconds.**

**Perfect for:** Playing side-by-side in the same room

</td>
</tr>
</table>
No install. No signup. No waiting.

<br/>

---

## 🎮 Games

<table>
<tr>
<td width="50%" align="center">

### 🏓 Pong
**The Classic. Reimagined.**

```
┌─────────────────────┐
│  P1    ●            │
│  ██                 │
│          ●  ──►     │
│                  ██ │
│            P2: 3    │
└─────────────────────┘
```

Built on **HTML5 Canvas** with physics that actually feel right. The ball speeds up every time it's hit, angles change based on where it strikes the paddle, and the tension builds until someone cracks under pressure.

| Feature | Detail |
|---------|--------|
| 🎯 Renderer | HTML5 Canvas 2D |
| ⚡ Physics | Angle-based deflection |
| 🏆 Win condition | First to 7 points |
| 🎮 Controls | Keyboard + Phone tap |
| 🔄 Modes | Mode 1 & Mode 2 |

</td>
<td width="50%" align="center">

### 🏎️ Car Race
**Full 3D. Full Speed.**

```
     🌅 Sunset Circuit
    ╭──────────────────╮
    │  🏎️ ──►          │
    │         ◄── 🚗   │
    │                  │
    ╰──────────────────╯
     Lap 2 / 3
```

Built with **Three.js + WebGL** — the same tech behind professional 3D web apps. Circuit track, real acceleration/friction physics, and a phone controller that makes your thumbs feel like a steering wheel.

| Feature | Detail |
|---------|--------|
| 🎯 Renderer | Three.js WebGL 3D |
| ⚡ Physics | Acceleration + friction + drift |
| 🏆 Win condition | First to complete 3 laps |
| 🎮 Controls | Keyboard + Phone joystick |
| 🔄 Modes | Mode 1 & Mode 2 |

</td>
</tr>
</table>

<br/>

---

## 🚀 Quick Start

### Prerequisites

```bash
node --version   # needs 18+
npm --version    # needs 8+
```

### 1️⃣ Clone the repo

```bash
git clone https://github.com/anuragjain-afk/playmates.git
cd playmates
```

### 2️⃣ Start the server

```bash
cd server
npm install
npm run dev        # nodemon — auto-restarts on changes
```

> ✅ Server is live at `http://localhost:3001`

### 3️⃣ Start the client

```bash
# In a new terminal
cd client
npm install
npm run dev
```

> ✅ App is live at `http://localhost:5173`

### 4️⃣ Open and play

```
http://localhost:5173
```

That's it. No config, no environment variables, no database. It just works.
## 🕹️ Two Ways to Play

<br/>

---

## 🕹️ How to Play

### Mode 1 — Two Devices (Online)

```
Player 1                          Player 2
────────                          ────────
Open localhost:5173               Open localhost:5173
Select game                       Select game
Select "Two Devices"              Select "Two Devices"
Click "Create Room"    ──────►    Click "Join Room"
Share code: X7K92     ──────►    Enter: X7K92
                                  
        ════════ GAME STARTS ════════
```

**⌨️ Keyboard Controls**

| | Player 1 | Player 2 |
|---|---|---|
| **Car Race** | `W` accelerate · `S` brake · `A` / `D` steer | `↑` accelerate · `↓` brake · `←` / `→` steer |
| **Pong** | `W` up · `S` down | `↑` up · `↓` down |
<div align="center">

<br/>
|  | 💻 Mode 1 — Two Devices | 📱 Mode 2 — Split Screen |
|:---:|:---|:---|
| **What it is** | Each player on their own laptop | One screen split in half, phones as controllers |
| **How it starts** | Share a 5-letter Room ID | Scan a QR code with your phone |
| **Where to play** | Anywhere in the world | Same room, side by side |
| **Controller** | Keyboard | Your phone — no app needed |
| **Feels like** | Classic online multiplayer | An arcade machine you built yourself |

### Mode 2 — Split Screen + Phone Controllers (Local)

```
┌─────────────────────────────────┐
│  LAPTOP SCREEN                  │
│  ┌──────────┬──────────┐        │
│  │          │          │        │
│  │  ▦ QR   │  ▦ QR   │        │
│  │ Player 1 │ Player 2 │        │
│  │          │          │        │
│  └──────────┴──────────┘        │
└─────────────────────────────────┘
        📱 scan     📱 scan
        ↓               ↓
  phone becomes    phone becomes
   controller       controller
```

> ⚠️ **Phones must be on the same WiFi network as the laptop.**  
> For remote testing, see [ngrok setup](#-local-development-with-ngrok) below.
</div>

<br/>

---

## 🏗️ Architecture

### How data flows

```
                    ┌─────────────────────────┐
                    │     Socket.io Server     │
                    │                          │
                    │  • Manages room sessions │
                    │  • Routes all messages   │
                    │  • No game logic here    │
                    └────────────┬─────────────┘
                                 │
               ┌─────────────────┼──────────────────┐
               │                 │                   │
        ┌──────┴───────┐  ┌──────┴───────┐  ┌───────┴──────┐
        │  Host Laptop │  │ Guest Laptop │  │   Phone      │
        │              │  │  (Mode 1)    │  │  (Mode 2)    │
        │ ✓ Runs game  │  │              │  │              │
        │   loop       │  │ • Sends      │  │ • Sends tap  │
        │ ✓ Broadcasts │  │   keypresses │  │   inputs     │
        │   game-state │  │ • Renders    │  │ • No render  │
        │   @ 60fps    │  │   game-state │  │   needed     │
        └──────────────┘  └──────────────┘  └──────────────┘
```

### Socket events

| Event | Who sends it | Who receives it | What it does |
|-------|-------------|-----------------|--------------|
| `create-room` | Host | Server | Creates a new room, returns 5-letter ID |
| `join-room` | Guest | Server | Joins existing room by ID |
| `join-controller` | Phone | Server | Registers phone as controller for Mode 2 |
| `player-input` | Guest / Phone | Host (via server) | Sends keypress/tap inputs at 60fps |
| `game-state` | Host | All players (via server) | Broadcasts full game state at 60fps |
| `game-start` | Server | Everyone in room | Fires when all players are connected |
| `player-disconnected` | Server | Remaining players | Notifies when someone leaves |

### Project structure

```
playmates/
│
├── 📁 server/
│   ├── index.js           ← Express + Socket.io setup, event handlers
│   ├── roomManager.js     ← Room create/join/destroy lifecycle
│   └── package.json
│
└── 📁 client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                  ← React Router (3 routes)
        ├── socket.js                ← Shared Socket.io client instance
        │
        ├── 📁 games/
        │   ├── Pong.js              ← createState · update · draw
        │   └── CarRace.js           ← createState · update · initRenderer · updateRenderer
        │
        └── 📁 pages/
            ├── Home.jsx             ← Game + mode selection screen
            ├── Lobby.jsx            ← Create / join room UI
            ├── Game.jsx             ← Game screen + HUD (handles both renderers)
            └── Controller.jsx       ← Mobile phone gamepad UI
```

<br/>

---

## ➕ Adding a New Game

Every game in Playmates follows a **3-function contract**. That's the entire interface.
## 🎮 The Games

```js
// client/src/games/YourGame.js

export const RENDERER_TYPE = 'canvas';   // 'canvas' or 'webgl'
export const INPUT_SCHEMA  = 'pong';     // 'pong' (up/down) or 'car' (accel/brake/steer)
<br/>

// Called once to create the starting game state
export function createInitialState() {
  return { ball: { x: 400, y: 300 }, score: [0, 0] };
}
### 🏓 Pong

// Called 60x per second — pure function, returns new state
export function update(state, inputs) {
  const s = JSON.parse(JSON.stringify(state));
  // inputs.p1 = { up, down }  or  { accelerate, brake, left, right }
  // ... your physics here
  return s;
}
The original. But better.

// Called 60x per second — draw everything on the canvas
export function draw(ctx, state) {
  ctx.clearRect(0, 0, 800, 600);
  // ... your rendering here
}
The ball speeds up every time it gets hit. The angle changes based on where it strikes your paddle. What starts as a casual warmup turns into a sweaty, tense rally where one mistake ends everything. First to **7 points** wins.

// Return winner player number (1 or 2), or null if game ongoing
export function checkWin(state) {
  return state.score[0] >= 7 ? 1 : state.score[1] >= 7 ? 2 : null;
}
```
> *"I'll just play one round." — No one, ever.*

Then in `Home.jsx`, add it to the `GAMES` array:
<br/>

```js
{ id: 'your-game', name: 'Your Game', emoji: '🎯', description: '...' }
```
### 🏎️ Car Race

Import it in `Game.jsx`:
Full **3D graphics** in a browser tab. No plugins. No downloads.

```js
import * as YourGame from '../games/YourGame';
const GAME_MODULES = { pong: Pong, 'car-race': CarRace, 'your-game': YourGame };
```
Race on a real circuit track with barriers and trees. The physics actually feel like driving — you build up speed, brake before corners, and fight for position. Use your keyboard, or in Mode 2, **your phone becomes a steering wheel.** First to complete **3 laps** wins.

**That's it.** The networking, room management, controller sync, and HUD all work automatically.
> *Built with Three.js WebGL — the same technology behind professional 3D web apps.*

<br/>

---

## 🔧 Local Development with ngrok

For Mode 2, phones need to reach your laptop's server. On a local network they connect directly. For testing across different networks, use ngrok:
<br/>

```bash
# Install ngrok from https://ngrok.com, then:
ngrok http 5173
```
## 📱 Phone as a Controller

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok.io`) and update `client/src/socket.js`:
This is the feature that surprises people most.

```js
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://abc123.ngrok.io';
```
In Mode 2, your phone **literally becomes a game controller** — no app store, no download, no Bluetooth pairing. Just scan a QR code and your phone's browser opens a controller page. Tap to accelerate, brake, and steer. There's even haptic feedback — your phone vibrates on every input.

Now the QR codes point to a publicly accessible URL and any phone can scan them.
It feels like magic. It's just WebSockets.

<br/>

---

## 🌍 Deployment

### Server → Railway (recommended, free tier available)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd server
railway init
railway up
```

Copy the deployed URL (e.g. `https://playmates-server.up.railway.app`)
<br/>

### Client → Vercel (recommended, free)
## ⚡ Quick Start

```bash
# Install Vercel CLI
npm install -g vercel
**1.** Clone the repo and install dependencies for both `server` and `client` folders

# Set the server URL and deploy
cd client
VITE_SERVER_URL=https://playmates-server.up.railway.app vercel --prod
```
**2.** Run the server (`npm run dev` inside `/server`)

Or set `VITE_SERVER_URL` in Vercel's environment variables dashboard and connect your GitHub repo for automatic deploys on every push.
**3.** Run the client (`npm run dev` inside `/client`)

### Environment variables
**4.** Open `http://localhost:5173` and play 🎉

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_SERVER_URL` | Client (Vercel) | Your Railway server URL |
| `PORT` | Server (Railway) | Set automatically by Railway |
> Full setup guide in the [Wiki](../../wiki) · Takes about 2 minutes from zero to playing

<br/>

---

## 🛠️ Tech Stack

<table>
<tr>
<td><b>Frontend</b></td>
<td>

![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_6-CA4245?style=flat&logo=react-router&logoColor=white)

</td>
</tr>
<tr>
<td><b>Real-time</b></td>
<td>

![Socket.io](https://img.shields.io/badge/Socket.io_4-010101?style=flat&logo=socket.io&logoColor=white)

</td>
</tr>
<tr>
<td><b>Backend</b></td>
<td>

![Node.js](https://img.shields.io/badge/Node.js_18-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_4-000000?style=flat&logo=express&logoColor=white)

</td>
</tr>
<tr>
<td><b>2D Rendering</b></td>
<td>

![Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=flat&logo=html5&logoColor=white)

</td>
</tr>
<tr>
<td><b>3D Rendering</b></td>
<td>
<br/>

![Three.js](https://img.shields.io/badge/Three.js_r160-000000?style=flat&logo=three.js&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=flat&logo=webgl&logoColor=white)
## 🧱 Built With

</td>
</tr>
<tr>
<td><b>QR Codes</b></td>
<td>
<div align="center">

![qrcode.react](https://img.shields.io/badge/qrcode.react_3.1-black?style=flat)
| Layer | Technology |
|:---:|:---:|
| 🎨 Frontend | React 18 + Vite |
| ⚡ Real-time | Socket.io |
| 🖥️ Backend | Node.js + Express |
| 🎮 2D Games | HTML5 Canvas |
| 🏎️ 3D Games | Three.js WebGL |
| 📷 QR Codes | qrcode.react |

</td>
</tr>
</table>
</div>

<br/>

---

## 📋 Known Limitations

| Limitation | Status | Fix |
|------------|--------|-----|
| 📶 Mode 2 requires same WiFi | Current | Deploy server → phones connect from anywhere |
| 👥 2 players per room max | Current | Architecture supports more — just needs UI work |
| 🔑 No user profiles or history | By design | Optional nickname leaderboard planned |
| ⏱️ ~20–50ms phone input latency | Expected | Fine for casual play; WebRTC would reduce it |

<br/>

---
## 🗺️ What's Coming

## 🗺️ Roadmap

- [ ] 🌐 Deploy server to Railway for global Mode 2 access
- [ ] 🐍 Add Snake game
- [ ] 🧱 Add Breakout game  
- [ ] 🏆 Nickname + session leaderboard
- [ ] 💬 Lobby chat before matches
- [ ] 🤖 Auto-matchmaking (no Room ID needed)
- [ ] 🎨 Custom car colors & paddle skins
- [ ] 👁️ Spectator mode
- [ ] 🏟️ Tournament bracket system
- [ ] 📱 Better haptic feedback patterns on phone controller
- 🌐 Deploy online so Mode 2 works from anywhere — no same-WiFi requirement
- 🐍 Snake game
- 🧱 Breakout game
- 🏆 Nickname-based leaderboard
- 💬 Lobby chat before matches
- 🤖 Auto-matchmaking — no Room ID needed
- 🎨 Custom car colors & paddle skins
- 👁️ Spectator mode
- 🏟️ Tournament bracket system

<br/>

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git clone https://github.com/YOUR_USERNAME/playmates.git
git checkout -b feature/your-cool-game
# ... make your changes ...
git commit -m "feat: add Snake game"
git push origin feature/your-cool-game
# Open a pull request on GitHub
```

<br/>

---
## 🙌 Contributing

## 📄 License
Found a bug? Have a game idea? Pull requests are very welcome.

[MIT](LICENSE) — do whatever you want with it.
Fork the repo → make your changes → open a PR. That's it.

<br/>

---

<div align="center">
<br/>

**Built in a single live session**
<div align="center">

*React · Socket.io · Node.js · Three.js · Vite*
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=120&section=footer&animation=fadeIn" width="100%"/>

<br/>
**Built in a single live coding session · React · Socket.io · Node.js · Three.js**

⭐ **If you found this useful, drop a star — it helps!** ⭐
*If this made you smile, drop a ⭐ — it means a lot!*

</div>
