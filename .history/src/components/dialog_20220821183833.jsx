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



export function $dialog(option){
    // element-plus中有el-dialog组件
    // 手动挂载组件 new subcomponent 
}