import { provide,inject, computed, createVNode, defineComponent, render,reactive, onMounted, ref, onBeforeUnmount } from "vue";

export const DropdownItem = defineComponent({
    props:{
        label:String,
        icon:String
    },
    setup(props,ctx){
        let {label,icon} = props
        // 子组件注入hide方法 点击选项执行其他操作 右键菜单消失
        let hide =  inject('hide')
        return  ()=><div class="dropdown-item" onClick ={hide}> 
            <i class={icon}></i>
            <span>{label}</span>
        </div>
    }
})


const DropdownComponent = defineComponent({
    props:{
        option:{type:Object},
    },

    setup(props,ctx){
        const state = reactive({
            option:props.option,
            isShow:false,
            top:0,
            left:0
        })
        ctx.expose({
            showDropdown(option){
                state.option = option;
                state.isShow = true;
                let {top,left,height} =  option.el.getBoundingClientRect();
                state.top = top + height;
                state.left = left;
            }
        });
        
        //父组件提供hide方法 
        provide('hide',()=>state.isShow = false)
        
        const classes = computed(()=>[
            'dropdown',
            {
                'dropdown-isShow': state.isShow
            }
        ])
        const styles = computed(()=>({
            top:state.top+'px',
            left:state.left + 'px'
        }))
        const el = ref(null)
        const onMousedownDocument = (e)=>{
            // 模板引用el 判断是不是点击的是dropdown内部 是就什么都不做
            if(!el.value.contains(e.target)){ 
                state.isShow = false;
            }
        }
        onMounted(()=>{
            // 事件的传递行为是先捕获 在冒泡
            // 之前为了阻止事件传播 我们给block 都增加了stopPropagation
            // 已经停止了冒泡!所以采用事件的捕获阶段
            document.body.addEventListener('mousedown',onMousedownDocument,true)
        })
        // 记得组件卸载之前要解绑监听器!!!
        onBeforeUnmount(()=>{
            document.body.removeEventListener('mousedown',onMousedownDocument)
        })
        return ()=>{
            // 右键的内容区
            return <div class={classes.value} style={styles.value}  ref={el}>
               {state.option.content()} 
            </div>
        }
    }
})


let vm;
export function $dropdown(option){
    // element-plus中是有el-dialog组件 
    // 手动挂载组件   new SubComponent.$mount()
    if(!vm){
        let el = document.createElement('div');
        vm = createVNode(DropdownComponent,{option}); // 将组件渲染成虚拟节点
    
        // 这里需要将el 渲染到我们的页面中
        document.body.appendChild((render(vm,el),el)) // 渲染成真实节点扔到页面中
    }
    // 将组件渲染到这个el元素上
    let {showDropdown} = vm.component.exposed
    showDropdown(option); // 其他说明组件已经有了只需要显示出来即可
}