// Stable, standalone source; no build tools, network calls or third-party assets.
const start = document.querySelector('#start');
const target = document.querySelector('#target');
const won = document.querySelector('#won');
const restart = document.querySelector('#restart');
start.onclick = () => { start.hidden = true; target.hidden = false; };
target.onclick = () => { target.hidden = true; won.hidden = false; restart.hidden = false; };
restart.onclick = () => { won.hidden = true; restart.hidden = true; start.hidden = false; };
