<template>
  <div class="music-playback-bar">
    <audio :src="playUrl" preload="auto" crossOrigin=“anonymous” muted id="audioPlay"></audio>
    <div id="switchPre">
      <div class="shape1"></div>
      <div class="shape2"></div>
    </div>
    <div id="playbackStatus">
      <div class="play" v-if="isPause">
        <div class="shape1"></div>
        <div class="shape1"></div>
      </div>
      <div class="pause" v-else>
        <div class="shape2"></div>
      </div>
    </div>
    <div id="switchNext">
      <div class="shape2"></div>
      <div class="shape1"></div>
    </div>
    <div id="progressBar">
      <div id="Pbar1" :style="`width: ${proCurX}%;`"></div>
      <div id="Pbar2"></div>
      <div id="progressBarCursor" :style="`left: ${proCurX}%;`"></div>
      <div class="currentTime">{{computeTime(currentTime) +'/'+ computeTime(duration)}}</div>
    </div>
    <div class="otherOpt">
      <div id="volumeControl">
        <div id="playHorn">
          <img v-if="volume === 0" src="../../assets/pic/shengyinguan.svg"/>
          <img v-else src="../../assets/pic/shengyinkai.svg"/>
        </div>
        <transition name="controlBar">
          <div id="controlBar" v-show="isControlBarShow">
            <div id="Cbar1" :style="`height: ${volume}%;`"></div>
            <div id="Cbar2"></div>
            <div id="controlBarCursor" :style="`bottom: ${volume}%;`"></div>
          </div>
        </transition>
      </div>
      <div id="cycleMode">
        <img v-if="isSingleCycle" src="../../assets/pic/danquxunhuan.svg" >
        <img v-else src="../../assets/pic/liebiaoxunhuan.svg" >
      </div>
      <div id="playlist">
        <img src="../../assets/pic/bofangliebiao.svg" >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { computed, onMounted, reactive, toRefs, watch, watchEffect } from '@vue/composition-api';
// import MusicPlaylist from '@/components/MusicPlaylist/index.vue';
import { getFrequencyData, establishAudioLink, computeTime, audioCtx } from "../../lib/tool.js";

export default {
  name: 'MusicPlaybackBar',
  props: {},
  components: {
    // MusicPlaylist,
  },
  setup(props, context) {
    const store = context.root.$store;
    let isFirstRender = true;
    const state = reactive({
      playUrl: computed(() => store.state.musicUrl),
      urlCode: computed(() => store.state.urlCode),
      musicList: computed(() => store.state.musicList),
      isPause: false,
      playProgress: 0,
      proCurX: 0,
      volume: 0,
      currentTime: 0,
      duration: 0,
      isSingleCycle: false,
      isControlBarShow: false,
    })
    

    onMounted(() => {
      const audioDom = document.getElementById('audioPlay') as HTMLElement;
      const switchPre = document.getElementById('switchPre') as HTMLElement;
      const playbackStatus = document.getElementById('playbackStatus') as HTMLElement;
      const switchNext = document.getElementById('switchNext') as HTMLElement;
      const progressBarCursor = document.getElementById('progressBarCursor') as HTMLElement;
      const progressBar = document.getElementById('progressBar') as HTMLElement;
      const controlBarCursor = document.getElementById('controlBarCursor') as HTMLElement;
      const controlBar = document.getElementById('controlBar') as HTMLElement;
      const volumeControl = document.getElementById('volumeControl') as HTMLElement;
      const playHorn = document.getElementById('playHorn') as HTMLElement;
      const cycleMode = document.getElementById('cycleMode') as HTMLElement;

      establishAudioLink();

      state.volume = (audioDom as any).volume * 100;      

      const switchMusic = (str: string) => {
        let len = state.musicList.length,
            code = state.urlCode;
        
        if (str === 'pre') {
          if (state.urlCode === 0) {
            store.commit('changeurlCode', len - 1)
          } else {
            store.commit('changeurlCode', code - 1);
          }
        } else if (str === 'next')  {
          if (state.urlCode === len - 1) {
            store.commit('changeurlCode', 0)
          } else {
            store.commit('changeurlCode', code + 1);
          }
        }

        state.isPause = false;
      };

      const dragBarCursor = (event: any) => {
        if ( event.currentTarget.id === 'progressBar' ) {
          let val = (event.clientX - progressBar.offsetLeft - (progressBarCursor.offsetWidth / 2) ) / progressBar.offsetWidth * 100;
          val = val > 100 ? 100 : val;
          val = val < 0 ? 0 : val;
          state.proCurX = val;
          const curTime = (audioDom as any).duration * val / 100;
          state.currentTime = curTime;
          (audioDom as any).currentTime = isNaN(curTime) ? 0 : curTime;
        } else if ( event.currentTarget.id === 'controlBar' ) {
          let val: number = 0;
          const boxHeight = controlBar.offsetHeight + 1;
          if ( event.target.id === 'controlBarCursor' ) {
            val = 100 - ((event.offsetY + event.target.offsetTop) / boxHeight) * 100;
          } else {
            val = 100 - (event.offsetY / boxHeight) * 100;
          }
          val = val > 100 ? 100 : val;
          val = val < 0 ? 0 : val;
          state.volume = val;
          (audioDom as any).volume = val / 100;
        }
      };

      const removeDragBarCursor = () => {
        progressBar.removeEventListener('mousemove', dragBarCursor);
        controlBar.removeEventListener('mousemove', dragBarCursor);
      };

      const timeupdate = (event: Event) => {
        state.currentTime = (audioDom as any).currentTime;
        const val = ((audioDom as any).currentTime / (audioDom as any).duration) * 100;
        state.proCurX = isNaN(val) ? 0 : val;
      };

      const playEnd = (event: Event) => {
        if (state.isSingleCycle) {
          (audioDom as any).play();
        } else {
          switchMusic('next')
        }
      };
 
      watch(
        () => state.isPause,
        (isPause, preIsPause) => {
          if (isPause) {
            // navigator.mediaDevices.getUserMedia({ audio: true });
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
              audioCtx.resume().then(() => {
                (audioDom as any).play();

              });
            });
          } else {
            (audioDom as any).pause();
          }
        }
      );

      watchEffect(async () => {
        if (!state.musicList[state.urlCode]) return;
        const obj = state.musicList[state.urlCode];
        const { data, statusText } = await axios.get(`/song/url?id=${obj.id}`);
        // const { data, statusText } = await axios.get(`/song/url?id=1907800779`);
        if (statusText === 'OK') {
          if (!data.data[0].url) {
            console.log(data.data[0]);
            
            console.log('等待错误处理解决方案');
            // () => switchMusic('next');
          } else {
            store.commit('changemusicUrl', data.data[0].url);
            store.commit('setBackgroundPic', obj.album.blurPicUrl);
            store.commit('setMusicID', obj.id);
          }
          if (!isFirstRender) { state.isPause = true };
        };
        
        isFirstRender = false;
      });

      switchPre.addEventListener('click', () => switchMusic('pre'));
      playbackStatus.addEventListener('click', () => {
        state.isPause = !state.isPause;
      });
      switchNext.addEventListener('click', () => switchMusic('next'));

      progressBar.addEventListener('mousedown', (event) => {
        event.preventDefault();
        dragBarCursor(event);
        progressBar.addEventListener('mousemove', dragBarCursor);
      });
      progressBar.addEventListener('mouseup', (event) => {
        event.preventDefault();
        removeDragBarCursor();
        dragBarCursor(event);
      });
      window.addEventListener('mouseup', removeDragBarCursor);

      audioDom.addEventListener('timeupdate', timeupdate);
      audioDom.addEventListener('ended', playEnd);
      audioDom.addEventListener('volumechange', (event: any) => {
        state.volume = event.target.volume * 100;
      });

      controlBar.addEventListener('mousedown', (event) => {
        event.preventDefault();
        dragBarCursor(event);
        controlBar.addEventListener('mousemove', dragBarCursor);
      })
      controlBar.addEventListener('mouseup', (event) => {
        event.preventDefault();
        removeDragBarCursor();
        dragBarCursor(event);
      })
      window.addEventListener('mouseup', removeDragBarCursor);

      playHorn.addEventListener('click', () => {
        state.isControlBarShow = !state.isControlBarShow;
      })

      audioDom.addEventListener('loadedmetadata', (event) => {
        state.duration = (audioDom as any).duration;
        const dataArray = getFrequencyData();
        store.commit('setFrequencyData', dataArray);
      });

      cycleMode.addEventListener('click', () => {
        state.isSingleCycle = !state.isSingleCycle;
      })
    });

    return {
      ...toRefs(state),
      computeTime,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.music-playback-bar {
  height: 10vh;
  width: 100%;
  background-color: #ffffff00;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%);
  display: flex;
  align-items: center;
  justify-content: space-around;

  #switchPre, #playbackStatus, #switchNext {
    justify-content: space-around;
    cursor: pointer;
  }

  #playbackStatus {
    width: 1.7vw;
    height: 2vw;
    display: flex;
    justify-content: space-between;
    .play {
      display: flex;
      width: 1.7vw;
      justify-content: space-between;
      .shape1 {
        height: 100%;
        width: .5vw;
        border-radius: 4px;
        background-color: #ffffff;
      }
    }
    
    .shape2 {
      border-right: 1.4vw solid #ffffff;
      border-top: 1vw solid transparent;
      border-bottom: 1vw solid transparent;
      transform: rotate(180deg) scale(1.4);
    }
  }

  #switchPre, #switchNext {
    width: 2vw;
    height: 2vw;
    display: flex;
    justify-content: space-between;
    .shape1 {
      height: 100%;
      width: .5vw;
      border-radius: 4px;
      background-color: #ffffff;
    }
    .shape2 {
      border-right: 1.4vw solid #ffffff;
      border-top: 1vw solid transparent;
      border-bottom: 1vw solid transparent;
    }
  }

  #switchNext {
    .shape2 {
      transform: rotate(180deg);
    }
  }

  #progressBar {
    height: 2.3vw;
    width: 30vw;
    display: flex;
    align-items: center;
    position: relative;
    justify-content: flex-end;

    #Pbar1 {
      height: .3vw;
      position: absolute;
      left: 0;
      background-color: #ffffffd9;
    }

    #Pbar2 {
      width: 100%;
      height: .3vw;
      position: absolute;
      left: 0;
      background-color: #ffffff6c;
    }
 
    #progressBarCursor {
      height: 1vw;
      width: 0.8vw;
      position: absolute;
      border-radius: 20%;
      cursor: pointer;
      background-color: #fff;
    }

    .currentTime {
      color: #fff;
      font-size: 1vw;
      position: absolute;
      top: 1.5vw;
    }
  }

  .otherOpt {
    width: 10vw;
    display: flex;
    justify-content: space-around;

    img {
      width: 2vw;
      height: 2vw;
    }
  }

  #volumeControl {
    position: relative;

    #controlBar {
      display: flex;
      position: absolute;
      width: 1vw;
      height: 6.5vw;
      justify-content: center;
      transform: translate(50%, -150%);
      transition: all .5s ease-out;

      #Cbar1 {
        width: .3vw;
        position: absolute;
        bottom: 0;
        background-color: #ffffffd9;
      }

      #Cbar2 {
        width: .3vw;
        height: 100%;
        position: absolute;
        background-color: #ffffff6c;
      }

      #controlBarCursor {
        height: 0.4vw;
        width: 1vw;
        position: absolute;
        border-radius: 20%;
        // cursor: pointer;
        background-color: #fff;
      }
    }
  }

}

.controlBar-enter, .controlBar-leave-to {
  opacity: 0;
}

.controlBar-enter-active, .controlBar-leave-active {
    transition: all .5s ease-out;
}

.controlBar-enter-to {
    opacity: .8;
}
</style>
