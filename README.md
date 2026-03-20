<div align="center">

<img src="https://capsule-render.vercel.app/api?type=venom&color=gradient&customColorList=12,20,24&height=300&section=header&text=PLAYMATES&fontSize=90&fontColor=ffffff&fontAlignY=55&desc=Real-time%20multiplayer%20browser%20games&descSize=22&descAlignY=75&animation=fadeIn&stroke=a78bfa&strokeWidth=2" width="100%"/>

<br/>

<!-- Typing animation -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&lines=No+downloads.+No+accounts.+Just+play.;Open+a+link.+Share+a+code.+Game+on.;Browser+games+with+real+3D+graphics.;Your+phone+is+the+controller.+Seriously." alt="Typing SVG" />
</a>

<br/><br/>

<!-- Badges Row 1 -->
[![License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18+-43853d?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev)

<!-- Badges Row 2 -->
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![Three.js](https://img.shields.io/badge/Three.js-3D_WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

<br/>

[![Stars](https://img.shields.io/github/stars/anuragjain-afk/playmates?style=social)](https://github.com/anuragjain-afk/playmates)
[![Forks](https://img.shields.io/github/forks/anuragjain-afk/playmates?style=social)](https://github.com/anuragjain-afk/playmates/fork)

<br/>

</div>

---

<br/>

<div align="center">

## 🎯 What is Playmates?

</div>

> **The problem:** Every multiplayer game wants you to download something, create an account, or pay a subscription. By the time you're done, you've lost the urge to play.
>
> **Playmates says no.** Open a URL. Share a 5-letter code. You're in a live game with your friend in **under 10 seconds.**

<br/>

<div align="center">

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   You          →    Share "X7K92"    →    Friend        │
│   Open URL          5 letter code        Opens URL      │
│                                                         │
│              ════════ PLAYING ════════                  │
│                    < 10 seconds                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

</div>

<br/>

---

<br/>

## 🕹️ Two Modes. One Mission.

<br/>

<table>
<tr>
<td width="50%" align="center">

### 💻 Mode 1
## Two Devices

<img src="https://img.shields.io/badge/Play_from-Anywhere_in_the_World-a78bfa?style=for-the-badge"/>

Each player opens Playmates on **their own device** — anywhere in the world. One creates a room, shares a 5-letter code, the other joins. Game starts the instant both connect.

**No lobby. No ready button. No countdown.**

`⌨️ Keyboard Controls`

</td>
<td width="50%" align="center">

### 📱 Mode 2
## Split Screen

<img src="https://img.shields.io/badge/Phones_become-Game_Controllers-f472b6?style=for-the-badge"/>

One laptop. Screen splits in half. Each half shows a **QR code**. Players scan it — their phone instantly becomes a wireless game controller. No app. No pairing. No Bluetooth.

**It feels like magic. It's just WebSockets.**

`📳 Haptic Feedback Included`

</td>
</tr>
</table>

<br/>

---

<br/>

## 🎮 The Games

<br/>

<table>
<tr>
<td width="50%">

<div align="center">

### 🏓 PONG
![](https://img.shields.io/badge/Renderer-HTML5_Canvas-orange?style=flat-square)
![](https://img.shields.io/badge/Win-7_Points-green?style=flat-square)

</div>

The classic — but deeply satisfying. Hit the ball at the **edge of your paddle** to send it at a sharp angle your opponent can't reach. The ball **speeds up every rally.** What starts casual ends tense.

```
● ──────────────────► ██
                        miss
██ ◄── ●
        POINT!
```

- 🎯 Angle-based paddle deflection
- ⚡ Ball accelerates every hit
- 🏆 First to 7 points wins
- 🎮 Works in both modes

</td>
<td width="50%">

<div align="center">

### 🏎️ CAR RACE
![](https://img.shields.io/badge/Renderer-Three.js_WebGL_3D-blueviolet?style=flat-square)
![](https://img.shields.io/badge/Win-3_Laps-green?style=flat-square)

</div>

**Full 3D graphics.** Real circuit. Real physics. The camera chases you from behind, pulling back as you hit top speed. Corner wrong and you **drift** into the barrier. Your phone controls the car.

```
     🌅 Sunset Circuit
  ╭──────────────────────╮
  │  🏎️ ──►   ◄── 🚗   │
  │   Lap 2/3  Lap 1/3   │
  ╰──────────────────────╯
```

- 🏁 3 unique tracks
- 🚗 3 cars with different stats
- 💨 Drift physics + exhaust particles
- 📱 Phone becomes steering wheel

</td>
</tr>
</table>

<br/>

---

<br/>

## 🚀 Get Running in 2 Minutes

<br/>

```bash
# 1. Clone
git clone https://github.com/anuragjain-afk/playmates.git
cd playmates

# 2. Server
cd server && npm install && npm run dev
# ✅ Running on http://localhost:3001

# 3. Client (new terminal)
cd client && npm install && npm run dev
# ✅ Running on http://localhost:5173
```

**Open `http://localhost:5173` — you're ready to play.** 🎉

<br/>

---

<br/>

## 📱 The Phone Controller

<div align="center">

*This is the feature that surprises everyone.*

</div>

<br/>

Scan a QR code → phone opens a web page → that page **is** the controller. Tap to accelerate, brake, steer. The phone **vibrates** on every input — it feels like a physical button.

```
┌──────────────────────────────────┐
│            PLAYER 1              │
│                                  │
│  ┌────┐  ┌──────────────┐  ┌────┐│
│  │    │  │              │  │    ││
│  │ ◀  │  │   ▲  GAS     │  │ ▶  ││
│  │    │  │              │  │    ││
│  └────┘  └──────────────┘  └────┘│
│                                  │
│  └──────── 🛑 BRAKE ──────────┘  │
└──────────────────────────────────┘
         📳 vibrates on tap
```

No app store. No Bluetooth. No pairing. Works in Safari and Chrome. **Just a URL.**

<br/>

---

<br/>

## 🏗️ How It All Works

<br/>

<div align="center">

```
              ┌─────────────────────┐
              │   Socket.io Server  │
              │                     │
              │  Routes messages    │
              │  Manages rooms      │
              │  Zero game logic    │
              └──────────┬──────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
    ┌──────┴─────┐       │      ┌──────┴─────┐
    │   HOST     │       │      │  GUEST /   │
    │  Laptop    │       │      │   PHONE    │
    │            │       │      │            │
    │ Runs the   │       │      │ Sends taps │
    │ game loop  │       │      │ Sees game  │
    │ Broadcasts │       │      │ state      │
    │ @ 60fps    │       │      │            │
    └────────────┘       │      └────────────┘
```

</div>

<br/>

**Just 4 socket events power the entire platform:**

| Event | What it does |
|:------|:-------------|
| `create-room` | Host creates a session, gets a 5-letter ID back |
| `join-room` | Guest joins by entering the ID |
| `player-input` | Keypresses / taps sent to host at 60fps |
| `game-state` | Host broadcasts game state to all players at 60fps |

<br/>

---

<br/>

## 🛠️ Tech Stack

<br/>

<div align="center">

| | Technology | Why |
|:---:|:---|:---|
| 🎨 | **React 18 + Vite** | Fast dev, instant HMR, clean component model |
| ⚡ | **Socket.io** | WebSocket rooms, auto-reconnect, 60fps relay |
| 🖥️ | **Node.js + Express** | Lightweight server, zero game logic |
| 🎮 | **HTML5 Canvas** | 2D rendering for Pong |
| 🏎️ | **Three.js WebGL** | Full 3D scene for Car Race |
| 📷 | **qrcode.react** | Dynamic QR codes with room IDs embedded |

</div>

<br/>

---

<br/>

## 🗺️ Roadmap

<br/>

```
NOW                    SOON                   FUTURE
 │                      │                      │
 ✅ Pong                🔲 Snake               🔲 3+ players
 ✅ Car Race            🔲 Breakout            🔲 Spectator mode
 ✅ Phone controller    🔲 Leaderboard         🔲 Tournaments
 ✅ 3 tracks            🔲 Lobby chat          🔲 Custom skins
 ✅ 3 cars              🔲 Auto-matchmaking    🔲 Voice chat
 🔲 Deploy online       🔲 Nicknames           🔲 Mobile app
```

<br/>

---

<br/>

## 🤝 Contributing

Good ideas and pull requests are always welcome.

```bash
git fork https://github.com/anuragjain-afk/playmates
git checkout -b feature/your-idea
git commit -m "feat: your cool thing"
git push && open a PR
```

Want to add a game? It takes **3 functions**. See the [Wiki →](https://github.com/anuragjain-afk/playmates/wiki/Adding-a-Game)

<br/>

---

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=140&section=footer&text=Built%20in%20one%20live%20session&fontSize=28&fontColor=ffffff&fontAlignY=55&animation=fadeIn" width="100%"/>

**React · Socket.io · Node.js · Three.js · Vite**

<br/>

*If Playmates made you smile — drop a ⭐ It genuinely helps.*

[![Star](https://img.shields.io/github/stars/anuragjain-afk/playmates?style=for-the-badge&logo=github&color=a78bfa)](https://github.com/anuragjain-afk/playmates)

</div>
