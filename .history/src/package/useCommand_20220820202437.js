import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "./events";

export function useCommand(data) {
  const state = {
    //前进后退需要指针
    current: -1, //前进后退的索引值
    queue: [], //存放所有的操作命令
    commands: {}, //制作命令和执行功能一个映射表 undo:()=>{}  redo:()=>{}
    commandArray: [], //存放所有的命令
    destroyArray: [],
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = () => {
      //命令名字对应执行函数

      const { redo, undo } = command.execute();
      redo();
      if (!command.pushQueue) {
        //不需要放到队列里 直接跳过
        return;
      }
      let { queue, current } = state;

      //如果先放了组件1 -》 组件2 -》 撤回 -》 组件3
      //组件1 -》 组件3

      if (queue.length > 0) {
        queue = queue.slice(0, current + 1); // 可能在放置的过程中 右撤销操作 所以根据当前最新的current来计算新的
        state.queue = queue;
      }

      queue.push({ redo, undo }); //保存指令的前进后退
      state.current = current + 1;
      console.log(queue);
    };
  };

  //注册我们需要的命令
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1]; //找到当前的下一步重做操作
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });
  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          if (state.current == -1) return; //没有可以撤销的
          let item = state.queue[state.current]; //找到上一步还原
          if (item) {
            item.undo && item.undo(); //这里没有操作队列
            state.current--;
          }
        },
      };
    },
  });
  registry({
    //如果希望将操作放到队列中 可以增加一个属性 表示等会操作要放到队列中
    name: "drag",
    pushQueue: true,
    init() {
      //初始化操作 默认就会执行
      this.before = null;
      //监控拖拽开始事件，保存状态
      const start = () => {
        this.before = deepcopy(data.value.blocks);
      };
      //拖拽之后需要触发对应的指令
      const end = () => {
        state.commands.drag();
      };
      events.on("start", start);
      events.on("end", end);

      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },
    execute() {
      let before = this.before;
      let after = data.value.blocks; //之后的状态
      return {
        redo() {
          //默认一松手就直接把当前事情做了
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          //前一步的
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });
  const keyboardEvent = (() => {
    const keyCodes = {
      90: "z",
      89: "y",
    };
    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e; //ctrl+z  ctrl+y
      let keyString = [];
      if (ctrlKey) keyString.push("ctrl");
      keyCodes[keyCode];
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join("+");

      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return; //没有键盘事件
        if (keyboard === keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      //初始化事件
      window.addEventListener("keydown", onKeydown);
      return () => {
        //销毁事件
        window.removeEventListener("keydown", onKeydown);
      };
    };
    return init;
  })();
  (() => {
    //监听键盘事件
    state.destroyArray.push(keyboardEvent());
    state.commandArray.forEach(
      (command) => command.init && state.destroyArray.push(command.init())
    );
  })();

  onUnmounted(() => {
    //清理绑定的事件
    state.destroyArray.forEach((fn) => fn && fn());
  });
  return state;
}
