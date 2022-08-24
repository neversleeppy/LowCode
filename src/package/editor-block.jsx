import { computed, defineComponent, inject, onMounted, ref } from "vue"
import BlockResize from './block-resize'
export default defineComponent({
    props: {
        block: { type: Object },
        formData: { type: Object }
    },
    setup(props) {
        const blockStyles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: props.block.zIndex
        }));
        const config = inject('config');

        const blockRef = ref(null);
        onMounted(() => {
            let { offsetWidth, offsetHeight } = blockRef.value;
            if (props.block.alignCenter) {
                // 说明是拖拽松手的时候才渲染的，其他的默认渲染到页面上的内容不需要居中
                props.block.left = props.block.left - offsetWidth / 2;
                props.block.top = props.block.top - offsetHeight / 2;
                props.block.alignCenter = false;//让渲染后的结果才能去居中
            }
            props.block.width = offsetWidth;
            props.block.height = offsetHeight;

        });

        return () => {
            // 通过block的key属性直接获取对应的组件
            const component = config.componentMap[props.block.key];


            // 获取render函数
            const RenderComponent = component.render(
                {
                    //修改尺寸大小 一旦修改了就加上 如果修改了就加上宽高
                    size: props.block.hasResize ? { width: props.block.width, height: props.block.height } : {},
                    // model: props.block.model  => {default:'username'}  => {modelValue: FormData.username,"onUpdate:modelValue":v=> FormData.username = v}
                    // 每次渲染的时候 渲染文本跟实际渲染出来的效果要统一
                    props: props.block.props,

                    model: Object.keys(component.model || {}).reduce((prev, modelName) => {

                        let propName = props.block.model[modelName]; // 'username'
                        console.log(propName)
                        prev[modelName] = {
                            modelValue: props.formData[propName], // xiaomin
                            "onUpdate:modelValue": v => props.formData[propName] = v
                        }
                        return prev;
                    }, {})
                }
            );
            //取出宽高
             const { width, height } = component.resize || {}
             return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
                 {RenderComponent}
                 {/* //渲染的每个组件的盒子 设置锚点 传递block的目的是为了修改当前block的宽高， component中存放了是修改高度还是宽度 //查看他有没有被获取焦点，查看是否有宽高 */}
                 {props.block.focus && (width || height) && <BlockResize
                     block={props.block}
                     component={component}
                 ></BlockResize>}
             </div>
        }
    }
})