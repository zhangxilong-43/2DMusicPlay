<template>
  <div id="AudioDataVisualization">
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, computed, watch } from '@vue/composition-api';
import * as THREE from "../../lib/three.module";
// import OrbitControls from "../../lib/OrbitControls";
import { getFrequencyData, createColorValueRingLinkedList } from "../../lib/tool";

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, mesh: THREE.Mesh;
let gui = {
  R: 20,
  G: 90,
  B: 225,
};
let colorChangeCouunt = 0;
let RListNode = createColorValueRingLinkedList(gui.R);
let GListNode = createColorValueRingLinkedList(gui.G);
let BListNode = createColorValueRingLinkedList(gui.B);

// const axis = new THREE.Vector3(0, -20, 20); // 向量axis

let windowSize = {
  width: window.innerWidth,
  height: window.innerHeight / 10 * 8,
}
let barGroup: THREE.Group; // 柱子

export default {
  name: "AudioDataVisualization",
  setup(props, context) {
    const store = context.root.$store;
    const state = reactive({
      N: 256,
      musicUrl: computed(() => store.state.musicUrl),
      frequencyData: computed(() => store.state.frequencyData),
      backgroundPic: computed(() => store.state.backgroundPic),
    })

    let audioDom: HTMLMediaElement | null = null;

    watch(
      [
        () => state.backgroundPic,
        // () => state.screenDragVal,
      ],
      ([backgroundPic], [pre]) => {
        addImage(backgroundPic);
        // console.log(1, pre, backgroundPic, pre === backgroundPic);
      }
    );

    onMounted(() => {
      audioDom = document.getElementById('audioPlay') as HTMLMediaElement;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(windowSize.width, windowSize.height);
      const AudioDataVisualization = document.getElementById('AudioDataVisualization') as HTMLElement;
      AudioDataVisualization.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        windowSize.width / windowSize.height,
        1,
        10000
      );
      // var axisHelper = new THREE.AxesHelper(250);
      // scene.add(axisHelper);

      camera.position.z = 60;
      window.addEventListener("resize", onWindowResize, false);

      // var controls = new OrbitControls(camera,renderer.domElement);
      // controls.addEventListener('change', render);

      audioBars(25, state.N / 2); // 添加音频柱子
      initLight();
      addImage(state.backgroundPic);
      animate();
    })

    // 音频柱子
    const audioBars = (radius: number, countData: number) => {
      barGroup = new THREE.Group();
      let R = radius;
      let N = countData;
      for (let i = 0; i < N; i++) {
        let minGroup = new THREE.Group();
        let box = new THREE.BoxGeometry(0, 0, 0);
        let material = new THREE.MeshPhongMaterial({
          opacity: 0.5
        }); // 材质对象
        let m = i;
        let mesh = new THREE.Mesh(box, material);
        mesh.position.y = 0.5;
        // mesh.scale.set(0, 0, 0);

        minGroup.add(mesh);
        minGroup.position.set(
          Math.sin(((m * Math.PI) / N) * 2) * R,
          Math.cos(((m * Math.PI) / N) * 2) * R,
          0
        );
        minGroup.rotation.z = ((-m * Math.PI) / N) * 2;
        barGroup.add(minGroup);
      }
      scene.add(barGroup);
    };

    // 专辑封面
    const addImage = (url: string) => {
      const radius = 24.5,
            segments = 128;
      const bgcPicCircle = new THREE.CircleGeometry(radius, segments);
      const textureLoader = new (THREE.TextureLoader as any)();
      // 执行load方法，加载纹理贴图成功后，返回一个纹理对象Texture
      textureLoader.load(url, function(texture: any) {
        const material = new THREE.MeshLambertMaterial({
          // color: 0x0000ff,
          // 设置颜色纹理贴图：Texture对象作为材质map属性的属性值
          map: texture,//设置颜色贴图属性值
        }); //材质对象Material
        mesh = new THREE.Mesh(bgcPicCircle, material); //网格模型对象Mesh
        // mesh.rotateOnAxis(axis, Math.PI / 8);//绕axis轴旋转π/8

        scene.add(mesh); //网格模型添加到场景中

        render();
      })
    }

    const render = () => {
      renderer.render(scene, camera);
    }

    // 动态渲染 
    const animate = () => {
      if (state.frequencyData) {
        const arr = getFrequencyData();

        if (barGroup) {
          barGroup.children.forEach((elem: any, index: number) => {
            if (gui.R) {
              elem.children[0].material.color.r = arr[index] / (gui.R * 3);
            }
            if (gui.G) {
              elem.children[0].material.color.g = arr[index] / (gui.G * 3);
            }
            if (gui.B) {
              elem.children[0].material.color.b = arr[index] / (gui.B * 3);
            }
            // debugger;
            if (arr[index] === 0) {
              elem.scale.set(0, 0, 0);
            } else {
              let m = arr[index] / 20;
              let targetRange = Math.max(
                arr[index] / 20 - arr[index - 1] / 20,
                0
              );
              if (m < targetRange) {
                m = targetRange;
              }
              elem.scale.set(1, m, 1);
            }
          });
        }

        if (!(audioDom as HTMLMediaElement).paused) {
          mesh.rotation.z += 0.002;
          barGroup.rotation.z += 0.002;
  
          if (colorChangeCouunt === 0) {
            gui.R = RListNode.next.val;
            RListNode = RListNode.next;
            if (RListNode.val === 20) colorChangeCouunt = 1;
          } else if (colorChangeCouunt === 1) {
            gui.G = GListNode.next.val;
            GListNode = GListNode.next;
            if (GListNode.val === 90) colorChangeCouunt = 2;
          } else if (colorChangeCouunt === 2) {
            gui.B = BListNode.next.val;
            BListNode = BListNode.next;
            if (BListNode.val === 225) colorChangeCouunt = 0;
          }
  
          render();
        }
      }
      
      requestAnimationFrame(animate);
    };

    // 自适应屏幕
    const onWindowResize = () => {
      const height = window.innerHeight / 10 * 8;
      camera.aspect = window.innerWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, height);
      render();
    };

    // 环境光和平行光
    const initLight = () => {
      scene.add(new THREE.AmbientLight(0x444444));
      let light = new THREE.PointLight(0xffffff);
      light.position.set(80, 100, 50);
      //告诉平行光需要开启阴影投射
      light.castShadow = true;
      scene.add(light);
    };

  },
};
</script>

<style lang="less">
#AudioDataVisualization {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
</style>
