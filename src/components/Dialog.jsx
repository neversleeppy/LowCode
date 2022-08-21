import { ElDialog ,ElButton,ElInput} from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
    props:{
        option:{type:Object}
    },
    setup(props,ctx){
        const state = reactive({
            option:props.option, // 用户给组件的属性
            isShow:false
        })
        // 表示组件要暴露哪个方法
        ctx.expose({ // 让外界可以调用组件的方法
            showDialog(option){
                // 复用 内核复用
                // 因为两次传递的props不同，所以需要更新
                state.option = option;
                state.isShow = true;
            }
        });
        // 取消
        const onCancel = () =>{
            state.isShow = false;
        }
        // 确认
        const onConfirm = ()=>{
            state.isShow = false;
            // 转化内容
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }
        return ()=>{
            // title加名字
            return <ElDialog v-model={state.isShow} title={state.option.title}>
                {{
                    default:()=><ElInput 
                        type="textarea" 
                        v-model={state.option.content}
                        rows={10}
                    ></ElInput>,
                    // 判断是否有footer，没有不显示，有再显示
                    footer:()=> state.option.footer&& <div>
                        <ElButton onClick={onCancel}>取消</ElButton>
                        <ElButton type="primary"  onClick={onConfirm}>确定</ElButton>
                    </div>
                }}
            </ElDialog>
        }
    }   
})
let vm;
// 组件手动挂载
export function $dialog(option){
    // element-plus中有el-dialog组件
    // 手动挂载组件 new subcomponent 再调用.$mount
    // 没有VM时
    if(!vm){
         // 创建虚拟节点
        let el = document.createElement('div');
        // 将组件渲染成虚拟节点
        vm = createVNode(DialogComponent,{option});
        // 渲染成真实节点扔到页面
        // 这里需要将el渲染到页面中
        document.body.appendChild((render(vm,el),el))
    }
   
     // 将组件渲染到这个el元素上
    //  源码方法
     let {showDialog} = vm.component.exposed
     showDialog(option); // 其他说明组件已经有了只需要显示出来即可
}