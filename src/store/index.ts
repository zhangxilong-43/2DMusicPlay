import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    musicList: [],
    urlCode: 0,
    musicID: '',
    musicUrl: '',
    backgroundPic: '',
    frequencyData: null,
    // audioCurrentTime: 0,
  },
  mutations: {
    replacePlaylist(state, newList: []) {
      state.musicList = newList;
    },
    changemusicUrl(state, url: string) {
      state.musicUrl = url;
    },
    changeurlCode(state, code: number) {
      state.urlCode = code;
    },
    setBackgroundPic(state, url: string) {
      state.backgroundPic = url;
    },
    setFrequencyData(state, data: any) {
      state.frequencyData = data;
    },
    setMusicID(state, id: string) {
      state.musicID = id;
    },
    // setAudioCurrentTime(state, time: number) {
    //   state.audioCurrentTime = time;
    // }
  },
  actions: {
  },
  modules: {
  },
});
