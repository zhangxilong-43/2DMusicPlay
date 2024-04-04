<template>
  <div id="app" :style="`height: ${appHeight}`">
    <!-- <AudioDataVisualization /> -->
    <!-- <canvas id="canvas"></canvas> -->
    <div class="bg_player_mask"></div>
    <div class="bg_player" :style="`background-image: url(${backgroundPic}); opacity: '0'`"></div>
    <router-view/>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import AudioDataVisualization from '@/components/AudioDataVisualization/index.vue';
import { reactive, computed, toRefs, onBeforeMount, onMounted } from '@vue/composition-api';
export default {
  components: {
    AudioDataVisualization,
  },
  setup(props, context) {
    const urlCode = context.root.$store.state.urlCode;
    
    onBeforeMount(async () => {
      const { data, statusText } = await axios.get('/top/song?type=0');
      const store = context.root.$store;
      const res = await axios.get(`/song/url?id=${data.data[urlCode].id}`);
      
      const newMusicUrl = res.data.data[0].url;
      const backgroundPic = data.data[urlCode].album.blurPicUrl;
      
      if (statusText === 'OK') {
        store.commit('setBackgroundPic', backgroundPic);
        store.commit('replacePlaylist', data.data);
        store.commit('changemusicUrl', newMusicUrl);
        store.commit('setMusicID', data.data[urlCode].id);
      };
    });

    const state = reactive({
      backgroundPic: computed(() => context.root.$store.state.backgroundPic),
    })

    return {
      ...toRefs(state),
      appHeight: `${window.innerHeight}px`,
    }
  }
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.bg_player, .bg_player_mask {
  position: absolute;
  top: 0;
  left: 0;
}

.bg_player {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50%;
  filter: blur(80px);
  opacity: .5;
  transform: translateZ(0);
}

.bg_player_mask {
  background-color: rgba(0,0,0,.35);
  z-index: 1;
}
</style>
