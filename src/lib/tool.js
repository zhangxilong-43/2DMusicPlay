const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

function ListNode(val) {
    this.val = val;
    this.next = null;
}

const getFrequencyData = () => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount); // Uint8Array 的长度应该和 frequencyBinCount 相等
    analyser.getByteFrequencyData(dataArray); // 调用 getByteFrequencyData 方法填充 Uint8Array
    return dataArray;
};

const createColorValueRingLinkedList = (val) => {
    const head = new ListNode(val);
    let num = val,
        node = head;
    while(num <= 255) {
        num++;
        node.next = new ListNode(num);
        node = node.next;
    }
    num = -1;
    while(num < val) {
        num++;
        node.next = new ListNode(num);
        node = node.next;
    }
    node.next = head;
    return head;
}

const establishAudioLink = () => {
    const audioDom = document.getElementById('audioPlay');
    analyser.fftSize = 256 * 2;
    const source = audioCtx.createMediaElementSource(audioDom);
    source.connect(analyser);
    source.connect(audioCtx.destination);
}

const myDebounce = (cb, delay = 1000, immediate = true) => {
    let timer = null;
    return function (...args) {
      const context = this;
      const execNow = immediate && !timer;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        cb.apply(context, args);
        timer = null;
      }, delay);
      execNow && cb.apply(this, args);
    }
}

const computeTime = (value) => {
    if (isNaN(value)) {
      return '00:00:00';
    }
    let timeStr = '';
    timeStr = Math.floor(value / 3600) > 9
        ? `${Math.floor(value / 3600)}`
        : '0' + Math.floor(value / 3600);
    timeStr += 
      ':' + 
      (Math.floor((value % 3600) / 60) > 9
      ? Math.floor((value % 3600) / 60)
      : '0' + Math.floor((value % 3600) / 60));
    timeStr +=
      ':' +
      (Math.floor(((value % 3600) % 60) / 1) > 9
      ? Math.floor(((value % 3600) % 60) / 1)
      : '0' + Math.floor(((value % 3600) % 60) / 1));
    return timeStr;
  }

export { audioCtx, analyser, getFrequencyData, establishAudioLink, createColorValueRingLinkedList, myDebounce, computeTime };