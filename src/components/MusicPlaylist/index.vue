<template>
    <transition name="musicPlaylist">
        <div class="music-playlist" 
        v-if="isShow"
        :style="`top: ${playlistY}px; left: ${playlistX}px; `">
            <div class="searchInput" :class="{searchInputBefore: !isFocus && !inputText}" @click="searchInputClick" @keyup.enter="searchInputClick">
                <input ref="searchInput" type="text" :value="inputText" @input="inputSearchText" @blur="searchInputBlur">
            </div>
            <transition name="searchResultsBar">
                <div v-if="showKeyword && isFocus" class="searchResultsBar">
                <!-- <div v-if="showKeyword" class="searchResultsBar"> -->
                    <div @click="() => searchKeyword(showKeyword)"> 大家都在搜 {{showKeyword}}</div>
                </div>
            </transition>
            <ul>
                <li v-for="(item, i) of (searchSongsList || musicList)" :key="i" @click="() => playMusic(item, i)">
                    <div>{{item.name}}</div>
                    <div>{{item.artists[0].name}}</div>
                    <div>{{computeTime(item.duration / 1000)}}</div>
                </li>
            </ul>
        </div>     
    </transition>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, toRefs, watchEffect } from '@vue/composition-api';
import { myDebounce, computeTime } from "../../lib/tool";
import axios from 'axios';

export default defineComponent({
    name: 'MusicPlaylist',
    setup(props, context) {
        const store = context.root.$store;

        const state = reactive({
            playlistY: 0,
            playlistX: 0,
            isShow: false,
            isFocus: false,
            inputText: '',
            showKeyword: '',
            searchSongsList: null,
            musicList: computed(() => store.state.musicList),
            urlCode: computed(() => store.state.urlCode),
        })

        watchEffect(() => {
            if (!state.inputText) {
                state.searchSongsList = null;
            }
        })

        const clickCallback = (event: MouseEvent) => {
            if (state.isShow !== true) {
                state.playlistX = event.pageX - event.offsetX;
                state.playlistY = event.pageY - event.offsetY;
                state.isShow = true;
            } else {
                state.isShow = false;
                state.inputText = '';
            }
        }

        onMounted(() => {
            const playlist = document.getElementById('playlist') as HTMLElement;
            playlist.addEventListener('click', clickCallback);
        })

        const searchInputClick = () => {
            state.isFocus = true;
            (context.refs.searchInput as HTMLElement).focus();
            getSearchDefault();
        }

        const searchInputBlur = (e: Event) => {
            state.isFocus = false;
            if (!state.inputText) {
                state.searchSongsList = null;
            }
        }

        const getSearchDefault = async () => {
            const { data } = await axios.get('/search/default');
            if (data.code === 200) {
                state.showKeyword = data.data.realkeyword;
            }
        }

        const searchKeyword = async (keyword?: string) => {
            if (keyword) {
                state.inputText = state.showKeyword;
            }
            if (!state.inputText) {
                return;
            }
            const { data } = await axios.get(`/search?keywords=${state.inputText}`);
            state.searchSongsList = data.result.songs;
        }

        const debounceFn = myDebounce(searchKeyword, 1000, true);

        const inputSearchText = (e: Event) => {
            state.inputText = (e.target as EventTarget).value;
            debounceFn();
        }

        const playMusic = (item: any, i: number) => {
            // console.log(i, item.album.picUrl, item.mp3Url);
            if (i === state.urlCode) return;
            store.commit('changeurlCode', i);
            store.commit('setBackgroundPic', item.album.picUrl);
            store.commit('changemusicUrl', item.mp3Url);
        }
        
        return {
            ...toRefs(state),
            searchInputClick,
            inputSearchText,
            searchInputBlur,
            searchKeyword,
            computeTime,
            playMusic,
        }
    },
})
</script>

<style lang="less" scoped>
.music-playlist {
    z-index: 5;
    width: 20vw;
    height: 30vw;
    position: absolute;
    border-radius: .5vw;
    overflow: hidden;
    background-color: rgb(255, 255, 255);
    transform: translate(-100%, -102%);
    padding: .5vw;
    box-sizing: border-box;
    opacity: .8;
    box-shadow: #18181836 1px 1px 13px 2px;

    .searchInput {
        font-size: 12px;
        position: relative;

        input {
            width: 95%;
            border: 0;
            outline: none;
            padding: .5vw .5vw;
            color: #000c;
            background-color: #d2dae75c;
            border-radius: .5vw;
    
            &:focus {
                outline: none;
            }

            &:hover {
                cursor: default;
            }
    
        }
    }

    .searchInputBefore {
        &::before {
            content: "搜索歌曲";
            color: #0000004d;
            position: absolute;
            font-size: 12px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .searchResultsBar {
        position: absolute;
        width: 90%;
        left: 50%;
        top: 9%;
        transform: translateX(-50%);
        padding: .5vw;
        background-color: #d2dae7e5;
        font-size: .9vw;
        color: #000000a1;
        cursor: pointer;
    }

    ul {
        height: 28vw;
        overflow: scroll;
        text-align: start;
        font-size: 1vw;

        li {
            display: flex;
            margin: .5vw;
            cursor: pointer;
            background-color: #dddddd26;
            justify-content: space-between;

            &:nth-child(odd) {
                background-color: #52525214;
            }

            div {
                width: 8vw;
                display: inline-block;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                word-break: break-all;

                &:first-of-type {
                    width: 10vw;
                }

                &:last-of-type {
                    width: 6vw;
                }

            }
        }

        &::-webkit-scrollbar {
            width: 0 !important;
        }
    }

}

// musicPlaylist
.musicPlaylist-enter, .musicPlaylist-leave-to {
    opacity: 0;
}

.musicPlaylist-enter-active, .musicPlaylist-leave-active {
    transition: all .5s ease-out 0s;
}

.musicPlaylist-enter-to {
    opacity: .8;
}

// searchResultsBar
.searchResultsBar-enter, .searchResultsBar-leave-to {
    opacity: 0;
}

.searchResultsBar-enter-active, .searchResultsBar-leave-active {
    transition: all .2s ease-out 0s;
}

.searchResultsBar-enter-to {
    opacity: .8;
}
</style>
