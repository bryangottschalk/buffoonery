import Phaser from 'phaser';

const initNarratorIntro = async () => {
  window.speechSynthesis.onvoiceschanged = function () {
    const synth = window.speechSynthesis;
    const voices = window.speechSynthesis.getVoices();
    const getGreeting = () => {
      var today = new Date();
      var curHr = today.getHours();
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
    msg1.voice = voices.find((v) => v.name === 'Daniel');
    msg1.rate = 7;
    msg1.pitch = 1;
    const msg2 = new SpeechSynthesisUtterance(
      `The rules are simple. Prompts will appear on your phone in which you will fill in the blank with your silliest, wackiest quips. After all prompts are submitted, the users that did not receive your prompts will be able to vote on which response they like best. The more votes you get, the higher your score will be.`
    );
    msg2.voice = voices.find((v) => v.name === 'Daniel');
    msg2.rate = 7;
    msg2.pitch = 1;
    const msg3 = new SpeechSynthesisUtterance(
      `Without further ado, let's get jiggy with it and start the game.`
    );
    msg3.voice = voices.find((v) => v.name === 'Daniel');
    msg3.rate = 7;
    msg3.pitch = 1;

    msg2.voice = voices.find((v) => v.name === 'Daniel');
    msg2.rate = 7;
    msg2.pitch = 1;
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
