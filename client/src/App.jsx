import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Controller from './pages/Controller';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/:roomId" element={<Game />} />
        {/* Phone controller page — opened via QR code scan */}
        <Route path="/controller/:roomId/:playerNum" element={<Controller />} />
      </Routes>
    </BrowserRouter>
  );
}
