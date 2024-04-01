<template>
    <div class="card2 row_center p5">
        <label>{{ ctx.name }}</label>
        <div style="margin-left: 5px; width: 30px; height: 30px; border-radius: 15px;" :style="{ backgroundColor: ctx.color }"></div>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';


interface Props {
    name: string,
    value: boolean,
}

interface Ctx {
    name: string,
    color: string,
}

function getColor(value: boolean) {
    if (value) {
        return 'red';
    }
    return 'gray';
}

const props = defineProps<Props>();
const ctx = reactive<Ctx>({
    name: props.name,
    color: getColor(props.value),
});

watch(props, () => {
    ctx.name = props.name,
    ctx.color = getColor(props.value);
})



</script>
