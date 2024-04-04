<template>
  <div class="home" id='home' style="height: 100%;">
    <MusicPlayingInterface />
    <MusicPlaybackBar />
    <MusicPlaylist />
  </div>
</template>

<script lang="ts">
import MusicPlaybackBar from '@/components/MusicPlaybackBar/index.vue'; // @ is an alias to /src
import MusicPlayingInterface from '@/components/MusicPlayingInterface/index.vue';
import MusicPlaylist from '@/components/MusicPlaylist/index.vue';
import { Data, onBeforeMount, reactive, SetupContext, computed, toRefs } from '@vue/composition-api';

export default {
  name: 'Home',
  components: {
    MusicPlaybackBar,
    MusicPlayingInterface,
    MusicPlaylist,
  },
  setup(props: Readonly<Data>, context: SetupContext) {
    return {};
  },
};
</script>

<style lang="less" scoped>

</style>
