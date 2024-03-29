import Phaser from 'phaser';
import axios from 'axios';

const addVoiceConfig = (utterance, voices, name, rate, pitch) => {
  utterance.voice = voices.find((v) => v.name === name);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 0.75;
};

const getHeaders = () => {
  return {
    headers: {
      'X-Api-Key': process.env.API_KEY
    }
  };
};

const initNarratorIntro = async () => {
  var synth = window.speechSynthesis;
  let hasVoicesChangedRan = false; // to stop from running multiple times
  synth.addEventListener('voiceschanged', function () {
    if (!hasVoicesChangedRan) {
      hasVoicesChangedRan = true;
      var voices = synth.getVoices();
      const getGreeting = () => {
        const today = new Date();
        const curHr = today.getHours();
        if (curHr < 12) {
          return 'good morning';
        } else if (curHr < 18) {
          return 'good afternoon';
        } else {
          return 'good evening';
        }
      };
      const msg1 = new SpeechSynthesisUtterance(
        `${getGreeting()} friends, welcome to Buffoonery, a game of mass chaos and destruction.`
      );
      addVoiceConfig(msg1, voices, 'Google UK English Male', 1, 1);
      const msg2 = new SpeechSynthesisUtterance(
        `The rules are simple. Prompts will appear on your phone in which you will fill in the blank with your silliest, wackiest quips. After all prompts are submitted, the users that did not receive your prompts will be able to vote on which response they like best.`
      );
      addVoiceConfig(msg2, voices, 'Google UK English Male', 1, 1);
      const msg3 = new SpeechSynthesisUtterance(
        `The more votes you get, the higher your score will be.`
      );
      addVoiceConfig(msg3, voices, 'Google UK English Male', 1, 1);
      const msg4 = new SpeechSynthesisUtterance(
        `Without further ado, let's get jiggy with it and start the game.`
      );
      addVoiceConfig(msg4, voices, 'Google UK English Male', 1, 1);
      synth.speak(msg1);
      // pauses between prompts
      msg1.onend = function (e) {
        setTimeout(() => {
          synth.speak(msg2);
        }, 500);
      };
      msg2.onend = function (e) {
        setTimeout(() => {
          synth.speak(msg3);
        }, 500);
      };
      msg3.onend = function (e) {
        setTimeout(() => {
          synth.speak(msg4);
        }, 500);
      };
    }
  });
};

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('Main');
  }
  preload() { }
  async create() {
    console.log('main scene started', this.sound);
    const game = window.game;
    initNarratorIntro();
    const headers = getHeaders();
    const { data } = await axios.put(
      `${process.env.API}/DistributePromptsToPlayers/${game.roomcode}`,
      null,
      headers
    );
    console.log('distribute prompts to players result:', data);
    this.music = this.sound.add('game-music');
    const musicConfig = {
      mute: false,
      volume: 0.1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    };
    this.music.play(musicConfig);
    this.background = this.add.image(
      this.game.config.width / 2 - 200,
      this.game.config.height / 2,
      'theater-background'
    );
    this.background.displayWidth = this.game.config.width - 300;
    this.background.scaleY = this.background.scaleX;
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2 - 375;
    this.roomcodeTitleText = this.add.text(
      screenCenterX,
      100,
      `Room code: ${game.roomcode}`,
      {
        fontSize: '40px'
      }
    );
  }
}
