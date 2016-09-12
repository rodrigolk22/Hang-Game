<template>
    <div id="app">
        <!-- if this client is a new player -->
        <login-form v-show="!joined" :nickname.sync="game.me"></login-form>

        <div v-show="joined" style="width: 100%; display: table">
            <div style="width:70%; float: left">
                the game
            </div>
            <div style="width: 30%; float: left">
                <player-list :players="game.players" :me="game.me"></player-list>
            </div>
        </div>

        <pre>{{ $data | json }}</pre>
    </div>
</template>

<script>
    import PlayerList from './components/PlayerList.vue'
    import LoginForm from './components/LoginForm.vue'
    export default {
        data: function () {
            return {
                game: {
                    me: '', // my nickname
                    players: [] // players data (including me)
                }
            }
        },
        computed: {
            joined: function () {
                return this.game.me != ''
            }
        },
        components: {
            PlayerList, LoginForm
        },
        created: function () {
            var self = this;

            // handler for game updates
            this.$socket.on('gameUpdated', function (game) {
                console.log(game);
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
