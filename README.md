# audiotest

# 🎧 Left / Right Audio Test App

A simple, fast, and accessible web application to verify the **stereo channel separation** of your headphones or speakers. Built with vanilla **HTML, CSS, and JavaScript** using the **Web Audio API** for precise audio control.



## ✨ Features

* **Quick Testing:** Immediately plays a 440 Hz sine wave tone upon button click.
* **Stereo Panning:** Test left channel (`-1`), right channel (`1`), or both channels (`0`).
* **Web Audio API:** Utilizes `AudioContext` and `StereoPannerNode` for accurate channel control.
* **Toggle Functionality:** Click a button to start the tone; click it again to stop it. The tone also stops automatically after 0.5 seconds.
* **PWA Ready:** Includes a basic manifest and service worker setup (`manifest.json` and `sw.js` are referenced, but content is not shown) for potential installation and offline use.
* **Dark Mode UI:** A clean, dark interface for easy viewing.