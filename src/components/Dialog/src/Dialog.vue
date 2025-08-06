<script setup lang="ts">
import { ElDialog, ElScrollbar } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { computed, useAttrs, ref, unref, useSlots, watch, nextTick } from 'vue'
import { isNumber } from '@/utils/is'

const slots = useSlots()

const props = defineProps({
  modelValue: propTypes.bool.def(false),
  title: propTypes.string.def('Dialog'),
  fullscreen: propTypes.bool.def(true),
  defaultFullscreen: propTypes.bool.def(false),
  maxHeight: propTypes.oneOfType([String, Number]).def('400px')
})

const getBindValue = computed(() => {
  const delArr: string[] = ['fullscreen', 'title', 'maxHeight']
  const attrs = useAttrs()
  const obj = { ...attrs, ...props }
  for (const key in obj) {
    if (delArr.indexOf(key) !== -1) {
      delete obj[key]
    }
  }
  return obj
})

const isFullscreen = ref(props.defaultFullscreen)

const toggleFull = () => {
  isFullscreen.value = !unref(isFullscreen)
}

const dialogHeight = ref(isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight)

watch(
  () => isFullscreen.value,
  async (val: boolean) => {
    await nextTick()
    if (val) {
      const windowHeight = document.documentElement.clientHeight
      // 修复高度计算：减去头部高度(54px)和padding(30px)
      // 如果有footer，还需要减去footer高度(63px)
      const headerHeight = 54
      const padding = 48
      const footerHeight = slots.footer ? 63 : 0
      dialogHeight.value = `${windowHeight - headerHeight - padding - footerHeight}px`
    } else {
      dialogHeight.value = isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight
    }
  },
  {
    immediate: true
  }
)

watch(
  () => props.maxHeight,
  (val) => {
    dialogHeight.value = isNumber(val) ? `${val}px` : val
  }
)

const dialogStyle = computed(() => {
  return {
    boxSizing: 'border-box',
    height: unref(dialogHeight)
  }
})
</script>

<template>
  <ElDialog
    v-bind="getBindValue"
    :fullscreen="isFullscreen"
    destroy-on-close
    lock-scroll
    draggable
    top="0"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <template #header="{ close }">
      <div class="flex dialog-title justify-between items-center h-54px pl-15px pr-15px relative">
        <slot name="title">
          {{ title }}
        </slot>
        <div
          class="h-54px flex justify-between items-center absolute top-[50%] right-15px translate-y-[-50%]"
        >
          <Icon
            v-if="fullscreen"
            class="cursor-pointer is-hover !h-54px mr-10px"
            :icon="
              isFullscreen ? 'vi-radix-icons:exit-full-screen' : 'vi-radix-icons:enter-full-screen'
            "
            color="var(--el-color-info)"
            hover-color="var(--el-color-primary)"
            @click="toggleFull"
          />
          <Icon
            class="cursor-pointer is-hover !h-54px"
            icon="vi-ep:close"
            hover-color="var(--el-color-primary)"
            color="var(--el-color-info)"
            @click="close"
          />
        </div>
      </div>
    </template>

    <ElScrollbar :style="dialogStyle">
      <slot></slot>
    </ElScrollbar>

    <template v-if="slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </ElDialog>
</template>

<style lang="less">
.@{elNamespace}-overlay-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.@{elNamespace}-dialog {
  margin: 0 !important;
  .dialog-title {
    height: 54px;
    padding: 0;
    margin-right: 0 !important;
    border-bottom: 1px solid var(--el-border-color);
  }
  &__body {
    padding: 15px !important;
  }

  &__footer {
    border-top: 1px solid var(--el-border-color);
  }

  &__headerbtn {
    top: 0;
  }
}
</style>
