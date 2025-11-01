import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentTrack: null,
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    audioElement: null,
    loop: true,
    isLoading: false,
    isVisible: false 
  }),
  
  actions: {
    setAudioElement(audio) {
      this.audioElement = audio;
      if (audio) {
        audio.loop = this.loop;

        audio.addEventListener('loadstart', () => {
          this.isLoading = true;
        });
        
        audio.addEventListener('canplay', () => {
          this.isLoading = false;
        });
        
        audio.addEventListener('error', (e) => {
          this.isLoading = false;
          this.isPlaying = false;
          console.error('Audio element error:', e);
        });
      }
    },

    // в defineStore actions
    async setTrack(trackData) {
      try {
        // Ожидаем: trackData должен быть ссылкой на объект из tracksStore.
        // НЕ клонируем объект, просто присваиваем ссылку.
        if (!trackData) throw new Error('trackData не задан');

        this.currentTrack = trackData; // <-- ссылка, а не копия
        this.currentTime = 0;
        this.isPlaying = false;
        this.isLoading = true;
        this.isVisible = true;

        if (this.audioElement && trackData.src) {
          // Устанавливаем src у audioElement (не меняем объект trackData.src)
          this.audioElement.src = trackData.src;
          this.audioElement.currentTime = 0;

          await new Promise((resolve, reject) => {
            const onCanPlay = () => {
              this.audioElement.removeEventListener('canplay', onCanPlay);
              this.audioElement.removeEventListener('error', onError);
              this.isLoading = false;
              resolve();
            };

            const onError = (e) => {
              this.audioElement.removeEventListener('canplay', onCanPlay);
              this.audioElement.removeEventListener('error', onError);
              this.isLoading = false;
              reject(e);
            };

            this.audioElement.addEventListener('canplay', onCanPlay);
            this.audioElement.addEventListener('error', onError);

            // load и canplay будут обработаны
            this.audioElement.load();
          });
        }
      } catch (error) {
        this.isLoading = false;
        console.error('Error loading track:', error);
        throw error;
      }
    },

    
    hidePlayer() {
      this.isVisible = false;
      this.currentTrack = null;
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = 0;
      
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.src = '';
      }
    },

    async play() {
      if (!this.currentTrack || !this.audioElement) {
        throw new Error('Трек не выбран');
      }
      
      try {
          if (!this.audioElement && typeof document !== 'undefined') {
    const el = document.querySelector('audio');
    if (el) this.setAudioElement(el);
  }

  if (!this.currentTrack || !this.audioElement) {
    throw new Error('Трек не выбран или audio элемент не инициализирован. Вызови playerStore.setAudioElement(audio).');
  }

        if (this.isLoading) {
          await new Promise(resolve => {
            const checkLoading = setInterval(() => {
              if (!this.isLoading) {
                clearInterval(checkLoading);
                resolve();
              }
            }, 100);
          });
        }
        
        await this.audioElement.play();
        this.isPlaying = true;
      } catch (error) {
        console.error('Error playing audio:', error);
        this.isPlaying = false;
        
        if (error.name === 'NotAllowedError') {
          throw new Error('Нажмите на кнопку воспроизведения для запуска трека');
        } else {
          throw error;
        }
      }
    },
    
    pause() {
      if (this.audioElement) {
        this.audioElement.pause();
        this.isPlaying = false;
      }
    },
    
    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play().catch(error => {
          console.error('Error in togglePlay:', error);
        });
      }
    },
    
    updateProgress({ currentTime, duration }) {
      this.currentTime = currentTime;
      this.duration = duration || this.duration;
    },
    
    seek(time) {
      this.currentTime = time;
      if (this.audioElement) {
        this.audioElement.currentTime = time;
      }
    },
    
    setVolume(volume) {
      this.volume = volume;
      if (this.audioElement) {
        this.audioElement.volume = volume;
      }
    },
    
    toggleLoop() {
      this.loop = !this.loop;
      if (this.audioElement) {
        this.audioElement.loop = this.loop;
      }
    }
  }
})