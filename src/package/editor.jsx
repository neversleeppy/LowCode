import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from './editor-block';
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog";
import { $dropdown, DropdownItem } from "../components/Dropdown";
import EditorOperator from './editor-operator'
import { ElButton } from "element-plus";


export default defineComponent({
    props: {
        modelValue: { type: Object },
        formData: { type: Object }
    },
    emits: ['update:modelValue'],

    setup(props, ctx) {
        // 预览的时候内容不能再操作了，可以点击 输入内容 方便看效果
        const previewRef = ref(true);
        // 是否正在处于编辑状态
        const editorRef = ref(true);

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
        let { blockMousedown, focusData, containerMousedown, lastSelectBlock, clearBlockFocus } = useFocus(data, previewRef, (e) => {
            //获取焦点后进行拖拽
            mousedown(e)
        });
        //实现组件拖拽
        let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

        const { commands } = useCommand(data, focusData);
        const buttons = [
            { label: '撤销', icon: 'icon-back', handler: () => commands.undo() },
            { label: '重做', icon: 'icon-forward', handler: () => commands.redo() },
            {
                label: '导出', icon: 'icon-export', handler: () => {
                    $dialog({
                        title: '导出JSON',
                        // 数据对象转为字符串
                        content: JSON.stringify(data.value),
                    })
                }
            },
            {
                label: '导入', icon: 'icon-import', handler: () => {
                    $dialog({
                        title: '导入JSON使用',
                        content: '',
                        footer: true,
                        onConfirm(text) {
                            // 测试数据是否有
                            // console.log(text);
                            // 这样更改无法保留历史记录
                            // data.value= JSON.parse(text);
                            commands.updateContainer(JSON.parse(text));
                        }
                    })
                }
            },
            { label: '置顶', icon: 'icon-place-top', handler: () => commands.placeTop() },
            { label: '置底', icon: 'icon-place-bottom', handler: () => commands.placeBottom() },
            { label: '删除', icon: 'icon-delete', handler: () => commands.delete() },
            {
                label: () => previewRef.value ? '编辑' : '预览', icon: () => previewRef.value ? 'icon-edit' : 'icon-browse', handler: () => {
                    previewRef.value = !previewRef.value;
                    clearBlockFocus()
                }
            },
            {
                label: '关闭', icon: 'icon-close', handler: () => {
                    editorRef.value = false;
                    clearBlockFocus();
                }
            },
        ]

        // 右键 打开上下文菜单
        const onContextMenuBlock = (e, block) => {
            e.preventDefault();
            $dropdown({
                el: e.target, // 以哪个元素为准产生一个dropdown
                content: () => {
                    return <>
                        <DropdownItem label="删除" icon="icon-delete" onClick={() => {
                            console.log("删除")
                            commands.delete()
                        }}></DropdownItem>
                        <DropdownItem label="置顶" icon="icon-place-top" onClick={() => commands.placeTop()}></DropdownItem>
                        <DropdownItem label="置底" icon="icon-place-bottom" onClick={() => commands.placeBottom()}></DropdownItem>
                        <DropdownItem label="查看" icon="icon-browse" onClick={() => {
                            $dialog({
                                title: '查看节点数据',
                                content: JSON.stringify(block)
                            })
                        }}></DropdownItem>
                        <DropdownItem label="导入" icon="icon-import" onClick={() => {
                            $dialog({
                                title: '导入节点数据',
                                content: '',
                                footer: true,
                                onConfirm(text) {
                                    text = JSON.parse(text);
                                    commands.updateBlock(text, block)
                                }
                            })
                        }}></DropdownItem>
                    </>
                }
            })
        }


        return () => !editorRef.value ? <>
            {/* 进入全屏预览状态, 只显示预览状态的编辑区*/}
            <div
                class="editor-container-canvas__content"
                style={containerStyles.value}

            >
                {
                    (data.value.blocks.map((block, index) => (
                        // 编辑块
                        <EditorBlock
                            class='editor-block-preview'
                            block={block}
                            formData={props.formData}
                        ></EditorBlock>
                    )))
                }
            </div>
            <div>
                <ElButton type="primary" onClick={() => editorRef.value = true}>继续编辑</ElButton>
                {JSON.stringify(props.formData)}
            </div>
        </> :
            // 编辑器
            <div class="editor">
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
                    {buttons.map((btn, index) => {
                        const icon = typeof btn.icon == 'function' ? btn.icon() : btn.icon
                        const label = typeof btn.label == 'function' ? btn.label() : btn.label
                        return <div class="editor-top-button" onClick={btn.handler}>
                            <i class={icon}></i>
                            <span>{label}</span>
                        </div>
                    })}
                </div>

                {/* 右侧属性控制栏 */}
                <div class="editor-right">
                    {/* 最后一个元素展示属性 */}
                    <EditorOperator
                        block={lastSelectBlock.value}
                        data={data.value}
                        updateContainer={commands.updateContainer}
                        updateBlock={commands.updateBlock}
                    >
                    </EditorOperator>
                </div>
                {/* 拖拽的盒子区域 */}
                <div class="editor-container">
                    {/* 负责产生滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 产生内容 */}
                        <div class="editor-container-canvas__content"
                            style={containerStyles.value}
                            ref={containerRef}
                            onMouseDown={containerMousedown}>

                            {(data.value.blocks.map((block, index) => (
                                <EditorBlock
                                    class={block.focus ? 'editor-block-focus' : ''}
                                    class={previewRef.value ? 'editor-block-preview' : ''}
                                    block={block}
                                    onMousedown={(e) => blockMousedown(e, block, index)}
                                    // 按下右键后 显示上下问菜单
                                    onContextmenu={(e) => onContextMenuBlock(e, block)}
                                    formData={props.formData}
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