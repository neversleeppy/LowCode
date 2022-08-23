import { defineComponent, inject, watch, reactive } from "vue";
import { ElForm, ElFormItem, ElButton, ElInputNumber, ElColorPicker, ElSelect, ElOption, ElInput } from 'element-plus'
import deepcopy from "deepcopy";
// import TableEditor from "./table-editor";

export default defineComponent({
    props: {
        block: { type: Object }, // 用户最后选中的元素
        data: { type: Object }, // 当前所有的数据
        // 复用两个更新方法
        updateContainer:{type:Function},
        updateBlock:{type:Function}
    },
    setup(props, ctx) {
        const config = inject('config'); // 组件的配置信息(app.vue已经暴露出来了)
        const state = reactive({
            // 用户改的配置信息
            editData: {}
        })
        const reset = () => {
         
            //如果没有选中零件  说明要改的是容器的宽度和高度
            if (!props.block) { 
                // 容器
                state.editData = deepcopy(props.data.container)
            } else {
                // 深复制零件的属性
                state.editData = deepcopy(props.block);
            }
        }
        watch(() => props.block, reset, { immediate: true })

        const apply = () =>{
            if (!props.block) { 
                // 更改组件容器的大小
                props.updateContainer({...props.data,container: state.editData});
            } else { 
                // 更改组件的配置
                props.updateBlock(state.editData,props.block);
            }

        }
       
        return () => {
            let content = []
            if (!props.block) {
                content.push(<>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                    </ElFormItem>
                </>)
            } else {

                let component = config.componentMap[props.block.key];
                if (component && component.props) { // {text:{type:'xxx'},size:{},color:{}}
                    // {text:xxx,size:13px,color:#fff}
                    content.push(Object.entries(component.props).map(([propName, propConfig]) => {
                        return <ElFormItem label={propConfig.label}>
                            {{
                                // 根据不同类型的零件 控制台不同
                                // props就是v-model绑定的值
                                input: () => {
                                return <ElInput v-model={state.editData.props[propName]}></ElInput>},
                                color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                                select: () => <ElSelect v-model={state.editData.props[propName]}>
                                    {propConfig.options.map(opt => {
                                        return <ElOption label={opt.label} value={opt.value}></ElOption>
                                    })}
                                </ElSelect>,
                                // table:()=> <TableEditor propConfig={propConfig} v-model={state.editData.props[propName]} ></TableEditor>
                            }[propConfig.type]()}
                        </ElFormItem>
                    }))
                }

                if(component && component.model){
                    //                                                 default   标签名
                    content.push(Object.entries(component.model).map(([modelName,label])=>{
                        return <ElFormItem label={label}>
                            {/* model => {default:"username"} */}
                            <ElInput  v-model={state.editData.model[modelName]}></ElInput>
                        </ElFormItem>
                    }))
                }
              
            }


            return <ElForm labelPosition="top" style="padding:30px">
                {content}
                <ElFormItem>
                    <ElButton type="primary" onClick={()=>apply()} >应用</ElButton>
                   
                    <ElButton onClick={reset}>重置</ElButton>
                </ElFormItem>
            </ElForm>
        }
    }
})