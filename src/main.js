import Client from './client/phaser/Client';
import axios from 'axios';

window.game = new Client();

const setPlayersInLobby = (numPlayersConnected) => {
    console.log('setting player count:', numPlayersConnected)
    const parent = document.getElementById('num-players');
    if (parent.childElementCount > 0) {
        document.getElementById('test').innerHTML = numPlayersConnected;
    } else {
        const el = document.createElement('div');
        el.id = 'test';
        el.innerHTML = numPlayersConnected;
        parent.appendChild(el);
    }
}


setTimeout(async () => {
    console.log('in settimeout')
    try {
        const { data } = await axios.get(
            `https://dev-api.buffoonery.io/getmeetingstate/${window.game.roomcode}`
        );
        if (data) {
            console.log('data', data)
            window.game.state = data;
            console.log('setting new clients', data.connectedClients.length)
            setPlayersInLobby(window.game.state.connectedClients.length)
        }
    } catch (err) {
        console.error(`error setting meeting state in timeout: ${err}`)
    }
}, 10000)