import { computed,ref} from 'vue';
export function useFocus(data, previewRef,callback) {//获取哪些元素被选中

    const selectIndex = ref(-1); //表示没有任何一个被选中

    //最后选择的那一个
    const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])

    const focusData = computed(() => {
        let focus = [];
        let unfocused = [];
        data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block));
        return { focus, unfocused }
    });
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false);//先清空其他人
    }
    const containerMousedown = () => {
        if(previewRef.value=)
        clearBlockFocus();//点击容器让选中的失去焦点
        selectIndex.value = -1;
    }
    const blockMousedown = (e, block, index) => {
        e.preventDefault();
        e.stopPropagation();
        //block上我们规划一个属性 focus 获取焦点后就将focus变为true
        if (e.shiftKey) {
            if (focusData.value.focus.length <= 1) {
                block.focus = true; //当只有一个节点被选中时，摁住shift键也不会切换focus
            } else {
                block.focus = !block.focus;
            }

        } else {
            if (!block.focus) {
                clearBlockFocus();
                block.focus = true;//要清空其他人focus属性
            } //当自己已经被选中了，再次点击时还是选中状态


        }
        selectIndex.value = index;
        callback(e)
    }

    return {
        blockMousedown,
        containerMousedown,
        focusData,
        lastSelectBlock
    }
}

