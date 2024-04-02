<template>
    <div class="card2 row_center p5 m5">
        <label>{{ props.name }}</label>
        <div style="margin-left: 5px; width: 25px; height: 25px; border-radius: 13px;" :style="{ backgroundColor: getColor(props.value) }"></div>
    </div>
</template>

<script setup lang="ts">

interface Props {
    name: string,
    value: boolean,
}

function getColor(value: boolean) {
    if (value) {
        return 'red';
    }
    return 'gray';
}

const props = defineProps<Props>();



</script>
