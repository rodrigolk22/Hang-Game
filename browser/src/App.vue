<template>
    <div id="app">
        <div style="width: 100%; display: table">
            <div style="width:70%; float: left">
                <h3 class="text-center">{{ game.status }}</h3>
                <p>The word is {{ game.currentSupressedWord }}</p><br/>
                <turn-choice v-if="game.status == 'WAITING_CHOICE'" :available-characters="game.availableCharacters"></turn-choice>
                <turn-guess v-if="game.status == 'WAITING_GUESS'"></turn-guess>
            </div>
            <div style="width: 30%; float: left">
                <player-list :players="game.players"></player-list>
            </div>
        </div>

        <pre>{{ $data | json }}</pre>
    </div>
</template>

<script>
    import PlayerList from './components/PlayerList.vue'
    import LoginForm from './components/LoginForm.vue'
    import TurnChoice from './components/TurnChoice.vue'
    import TurnGuess from './components/TurnGuess.vue'
    export default {
        data: function () {
            return {
                game: {
                    status: 'NOT_SYNCED',
                    me: '', // my nickname
                    players: [] // players data (including me)
                }
            }
        },
        computed: {

        },
        components: {
            TurnChoice, TurnGuess,
            PlayerList, LoginForm
        },
        created: function () {
            var self = this;

            // handler for game updates
            this.$socket.on('gameUpdated', function (game) {
                self.game = game;
            });
        }
    }
</script>

<style>
    body {
        background-color: #f0f0f0;
        font-family: Helvetica, sans-serif;
    }

    #app {
        padding: 20px;
        border-radius: 5px;
        margin: 30px auto;
        max-width: 700px;
        background-color: #fff;
    }
</style>
