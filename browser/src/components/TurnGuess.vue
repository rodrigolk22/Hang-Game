<template>
    <div>
        <form v-on:submit.prevent="sendGuess">
            <label>Guess or pass?</label>
            <input type="text" id="guess" v-model="word">
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
        },
        ready: function () {
            document.getElementById("guess").focus();
        }
    }
</script>
