import { computed, defineComponent, inject, ref} from "vue";
import './editor.scss'
import EditorBlock from './editor-block';
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog";




export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'],

    setup(props, ctx) {
        const data = computed({
            get() {
                return props.modelValue
            },
            set(newValue) {
                ctx.emit('update:modelValue', deepcopy(newValue))
            }
        });

        const containerStyles = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px',
        }))

        const config = inject('config');

        const containerRef = ref(null);
        //实现菜单的拖拽功能
        const { dragstart, dragend } = useMenuDragger(containerRef, data);



        // 实现获取焦点
        let { blockMousedown, focusData, containerMousedown, lastSelectBlock } = useFocus(data, (e) => {
            //获取焦点后进行拖拽
            mousedown(e)
        });
        //实现组件拖拽
        let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

        const {commands} = useCommand(data);
        const buttons = [
            {label:'撤销', icon:'icon-back', handler:()=>commands.undo()},
            {label:'重做', icon:'icon-forward', handler:()=>commands.redo()},
            {label:'导出', icon:'icon-export',handler:()=>{
                $dialog({
                    title:'导出JSON',
                    content:JSON.stringify(data.value),
                })
            }},
            {label:'导入', icon:'icon-import',handler:()=>{
                $dialog({
                    title:'',
                    content:'',
                    footer:true
                })
            }}
        ]



        return () => <div class="editor">
            {/* 菜单区 */}
            <div class="editor-left">
                {/* 根据注册列表 渲染对应的内容 可以实现h5的拖拽*/}
                {config.componentList.map(component => (
                    <div class="editor-left-item"
                        draggable
                        onDragstart={e => dragstart(e, component)}
                        onDragend={dragend}
                    >
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>))}

            </div>
            {/* 按钮区 map循环渲染按钮*/}
            <div class="editor-top">
                {buttons.map((btn,index)=>{
                    return <div class="editor-top-button" onClick={btn.handler}>
                        <i class={btn.icon}></i>
                        <span>{btn.label}</span>
                    </div>
                })}
            </div>
            <div class="editor-right">属性控制栏</div>
            {/* 拖拽的盒子区域 */}
            <div class="editor-container">
                {/* 负责产生滚动条 */}
                <div class="editor-container-canvas">
                    {/* 产生内容 */}
                    <div class="editor-container-canvas__content"
                        style={containerStyles.value}
                        ref={containerRef}
                        onMouseDown={containerMousedown}>

                        { (data.value.blocks.map((block, index) => (
                                <EditorBlock
                                    class={block.focus ? 'editor-block-focus' : ''}
                                    block={block}
                                    onMousedown={(e) => blockMousedown(e, block, index)}
                                ></EditorBlock>
                            )))}
                        {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                        {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
                    </div>
                           
                </div>
            </div>
        </div>
    }
})