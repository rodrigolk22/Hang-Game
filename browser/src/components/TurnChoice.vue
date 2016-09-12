<template>
    <div>
        <button v-for="character in availableCharacters"
                v-on:click="sendChoice(character)">{{ character }}</button>
    </div>
</template>
<script>
    export default {
        props: {
            availableCharacters: {
                type: Array,
                required: true
            }
        },
        methods: {
            sendChoice: function (character) {
                this.$socket.emit('choice', {
                    choice: character
                });
            }
        }
    }
</script>
