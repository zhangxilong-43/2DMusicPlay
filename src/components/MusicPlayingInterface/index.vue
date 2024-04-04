<template>
  <div id="interface">
    <AudioDataVisualization />
    <div id="scrollLyrics">
      <ul>
        <li 
          v-for="(item, index) in lyricsList" 
          :key="index"
          :style="lyricIndex === index ? 'display: block' : 'display: none'">
          {{item}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AudioDataVisualization from '@/components/AudioDataVisualization/index.vue';
import { computed, onMounted, reactive, watchEffect, toRefs } from '@vue/composition-api';
import axios from 'axios';

export default Vue.extend({
  name: 'MusicPlayingInterface',
  props: {},
  components: {
    AudioDataVisualization,
  },
  setup(props, context) {
    let startValue = 0,
        endValue = 0;
    let canvasDom: HTMLElement|null = null;
    let isSwitchSong = '';
    const store = context.root.$store;
    const threshold = window.innerWidth / 4;
    const state: {
      musicID: string,
      lyricsList: string[],
      lyricsTimeList: any[],
      lyricIndex: number,
    } = reactive({
      musicID: computed(() => store.state.musicID),
      lyricsList: [],
      lyricsTimeList: [],
      lyricIndex: 0,
    });

    watchEffect(async () => {
      if (state.musicID === '') return;
      const { data, status } = await axios.get(`/lyric?id=${state.musicID}`);
      if (status === 200) {
        state.lyricsTimeList = [];
        const lyricsArr = data.lrc.lyric.split('\n');
        const tempArr: string[] = [];
        state.lyricsList = lyricsArr.map((str: string) => {
          const timeStr = str.match(/\[.*\]/g);
          timeStr ? tempArr.push(timeStr[0].slice(1, -1)) : tempArr.push('');
          return str.replace(/\[.*\]/g, '');
        });
        state.lyricsTimeList = [...tempArr];

        state.lyricsTimeList = state.lyricsTimeList.map(str => {
          if (!str) return +Infinity;
          const minute = parseInt(str.split(':')[0]);
          const second = parseFloat(str.split(':')[1].slice(0, 5));
          const time = (minute * 60 + second);
          return time;
        });
      }
    });

    const timeupdate = (event: Event) => {
      const currentTime = parseFloat(event.target.currentTime.toFixed(2));
      const arr = [...state.lyricsTimeList];
      for (let i = 0; i < arr.length; i++) {
        if (currentTime >= arr[i]) {
          state.lyricIndex = i;
        }
      }
    };

    onMounted(() => {
      const MP3Interface = document.getElementById('interface') as HTMLElement;
      const switchPre = document.getElementById('switchPre') as HTMLElement;
      const switchNext = document.getElementById('switchNext') as HTMLElement;
      const scrollLyrics = document.getElementById('scrollLyrics') as HTMLElement;
      const audioDom = document.getElementById('audioPlay') as HTMLElement;

      const mouseAwayorUpEvent = () => {
        if (isSwitchSong === "NEXT") {
          switchNext.click();
        } else if (isSwitchSong === "PRE") {
          switchPre.click();
        }
        (canvasDom as HTMLElement).style.transform = 'translateX(0px)';
        (canvasDom as HTMLElement).style.opacity = '1';
        MP3Interface.removeEventListener('mousemove', moveSwitchMusic);
        isSwitchSong = '';
      }

      scrollLyrics.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      })

      canvasDom = document.getElementsByTagName('canvas')[0] as HTMLElement;
      MP3Interface.addEventListener('mousedown', (event) => {
        startValue = event.screenX;
        MP3Interface.addEventListener('mousemove', moveSwitchMusic);
      })
      MP3Interface.addEventListener('mouseup', mouseAwayorUpEvent);
      MP3Interface.addEventListener('mouseout', mouseAwayorUpEvent);

      audioDom.addEventListener('timeupdate', timeupdate);
    });

    const moveSwitchMusic = (event: any) => {
      endValue = event.screenX;
      const val = endValue - startValue;
      
      if (Math.abs(val) < threshold) {
        if (val < 0) {
          (canvasDom as HTMLElement).style.transform = `translateX(${val}px)`;
        } else {
          (canvasDom as HTMLElement).style.transform = `translateX(${val}px)`;
        }
        (canvasDom as HTMLElement).style.opacity = `${1 - Math.abs(val) / threshold}`;
      } else if (Math.abs(val) > threshold) {
        if (val < 0 && isSwitchSong !== 'NEXT') {
          isSwitchSong = 'NEXT';
        } else if (val > 0 && isSwitchSong !== 'PRE') {
          isSwitchSong = 'PRE';
        }
      }
    };

    return {
      ...toRefs(state),
    };

  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#interface {
  height: 90%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;

  #scrollLyrics {
    font-size: 15px;
    width: 50%;
    height: 10vh;
    overflow: hidden;
    z-index: 2;
    opacity: .8;
    font-weight: 380;
    color: #fff;

    ul {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
