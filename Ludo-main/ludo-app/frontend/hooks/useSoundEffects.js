import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

// Sound effect hook - ready for implementation
export const useSoundEffects = () => {
  const sounds = useRef({});

  useEffect(() => {
    // Load sounds when needed
    const loadSounds = async () => {
      try {
        // Uncomment and add sound files when ready
        // sounds.current.diceRoll = await Audio.Sound.createAsync(
        //   require('../assets/sounds/dice-roll.mp3')
        // );
        // sounds.current.tokenMove = await Audio.Sound.createAsync(
        //   require('../assets/sounds/token-move.mp3')
        // );
        // sounds.current.win = await Audio.Sound.createAsync(
        //   require('../assets/sounds/win.mp3')
        // );
        // sounds.current.countdown = await Audio.Sound.createAsync(
        //   require('../assets/sounds/countdown.mp3')
        // );
      } catch (error) {
        console.log('Error loading sounds:', error);
      }
    };

    loadSounds();

    return () => {
      // Cleanup sounds
      Object.values(sounds.current).forEach(async (sound) => {
        try {
          await sound.sound?.unloadAsync();
        } catch (error) {
          console.log('Error unloading sound:', error);
        }
      });
    };
  }, []);

  const playSound = async (soundName) => {
    try {
      const sound = sounds.current[soundName];
      if (sound) {
        await sound.sound.replayAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  return {
    playDiceRoll: () => playSound('diceRoll'),
    playTokenMove: () => playSound('tokenMove'),
    playWin: () => playSound('win'),
    playCountdown: () => playSound('countdown'),
  };
};

export default useSoundEffects;
