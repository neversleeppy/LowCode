import { ElDialog } from "element-plus";
import { render } from "sass";
import { createVNode, defineComponent } from "vue";


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


// 组件手动挂载
export function $dialog(option){
    // element-plus中有el-dialog组件
    // 手动挂载组件 new subcomponent 再调用.$mount

    // 创建虚拟节点
    let el = document.createElement('div');
    // 将组件渲染成虚拟节点
    vm = createVNode(DialogComponent,{option});
    // 
    document.body.appendChild(render(vm,el))
    //将组件渲染到el元素上




}