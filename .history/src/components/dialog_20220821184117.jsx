import { ElDialog } from "element-plus";
import { defineComponent } from "vue";


// 设计组件
const DialogComponent=defineComponent{
    setup(){
        return ()=>{

            return <ElDialog></ElDialog>
        }
    }
}


// 组件手动挂载
export function $dialog(option){
    // element-plus中有el-dialog组件
    // 手动挂载组件 new subcomponent 再调用.$mount
    let el =document.createElement

    //将组件渲染到el元素
    


}