<template>
    <div class="dialog" v-if="show" @click.stop="hideDialog">
        <div class="dialog__content" @click.stop>
            <slot></slot>
            <button @click="hideDialog" class="btn btn-danger">
                Скасувати
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Dialog',
    props: {
        show: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        hideDialog() {
            this.$emit('close');
        },
    },
};
</script>

<style>
.dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.dialog__content {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
