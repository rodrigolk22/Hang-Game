<template>
    <div>
        <form v-on:submit.prevent="sendGuess">
            <label>Adivinha ou passa a vez?</label>
            <input type="text" v-model="word">
        </form>
    </div>
</template>
<script>
    export default {
        data: function () {
            return {
                word: null
            }
        },
        methods: {
            sendGuess: function () {
                this.$socket.emit('guess', {
                    guess: this.word
                });
            }
        }
    }
</script>
