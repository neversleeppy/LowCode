<template>
  <div class="app">
    <Editor v-model="state" :formData="formData"></Editor>
    <!-- <Range :start="0" :end="100"></Range> -->
  </div>
</template>

<script>
import data from "./data.json";
import { ref, provide } from "vue";
import Editor from "./package/editor.jsx";
import { registerConfig as config } from "./utils/editor-config";

export default {
  components: {
    Editor,
  },
  setup() {
    const state = ref(data);
    provide("config", config);

    const formData = ref({
      username: "xiaoming",
      password: 123,
      start:0,
      end:100
    });

    return {
      state,
      formData,
    };
  },
};
</script>

<style lang="scss">
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
