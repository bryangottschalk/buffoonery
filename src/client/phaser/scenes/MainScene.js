import Phaser from 'phaser';

const addVoiceConfig = (utterance, voices, name, rate, pitch) => {
  utterance.voice = voices.find((v) => v.name === name);
  utterance.rate = rate;
  utterance.pitch = pitch;
};

const initNarratorIntro = async () => {
  window.speechSynthesis.onvoiceschanged = function () {
    const synth = window.speechSynthesis;
    const voices = window.speechSynthesis.getVoices();
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
    addVoiceConfig(msg1, voices, 'Daniel', 7, 1);
    const msg2 = new SpeechSynthesisUtterance(
      `The rules are simple. Prompts will appear on your phone in which you will fill in the blank with your silliest, wackiest quips. After all prompts are submitted, the users that did not receive your prompts will be able to vote on which response they like best.`
    );
    addVoiceConfig(msg2, voices, 'Daniel', 7, 1);
    const msg3 = new SpeechSynthesisUtterance(
      `The more votes you get, the higher your score will be.`
    );
    addVoiceConfig(msg3, voices, 'Daniel', 7, 1);
    const msg4 = new SpeechSynthesisUtterance(
      `Without further ado, let's get jiggy with it and start the game.`
    );
    addVoiceConfig(msg4, voices, 'Daniel', 7, 1);
    synth.speak(msg1);
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
  };
};

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('Main');
  }
  preload() {}
  create() {
    console.log('main scene started', this.sound);
    setTimeout(() => {
      initNarratorIntro();
    }, 2000);
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
  }
}
