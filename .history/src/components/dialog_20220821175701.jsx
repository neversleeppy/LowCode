import { ElDialog } from "element-plus";
import { defineComponent } from "vue";


// 组建
const DialogComponent=defineComponent{
    setup(){
        return ()=>{

            return <ElDialog></ElDialog>
        }
    }
}



export function $dialog(option){
    // element-plus中有el-dialog组件
}