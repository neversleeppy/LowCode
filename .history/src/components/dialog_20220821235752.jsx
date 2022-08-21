import { ElDialog } from "element-plus";
import { createVNode, defineComponent,render } from "vue";


// 设计组件
const DialogComponent=defineComponent(
    {   props:{
            option:{type:Object}
        },
        setup(){
            return ()=>{
    
                return <ElDialog></ElDialog>
            }
        }
    }
)

let vm;
// 组件手动挂载
export function $dialog(option){
    // element-plus中有el-dialog组件
    // 手动挂载组件 new subcomponent 再调用.$mount

    // 创建虚拟节点
    let el = document.createElement('div');
    // 将组件渲染成虚拟节点
    vm = createVNode(DialogComponent,{option});
    // 渲染成真实节点扔到页面
    // 这里需要将el渲染到页面中
    document.body.appendChild((render(vm,el),el))
    //将组件渲染到el元素上




}