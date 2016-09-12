<template>
    <div id="app">
        <div class="box text-center">
            <h3>{{ status }}</h3>
            <p v-show="word"><b>Word is:<b/> {{ word }}</p>
            <p v-show="timer"><b>Time:<b/> {{ timer }}</p>
            <br/>
            <turn-choice v-if="isWaitingMyChoice" :available-characters="game.availableCharacters"></turn-choice>
            <turn-guess v-if="isWaitingMyGuess"></turn-guess>
        </div>
        <div>
            <player-list :players="game.players"></player-list>
        </div>
        <div>{{  }}</div>

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
                timer: 0,
                game: {
                    me: null,
                    currentPlayer: null,
                    currentGenerator: null,
                    currentSupressedWord: '',
                    timer: 0,
                    status: 'NOT_SYNCED',
                    players: [] // players data (including me)
                }
            }
        },
        computed: {
            status: function () {
                var currentPlayer = this.game.currentPlayer;
                switch (this.game.status) {
                    case 'NOT_SYNCED':
                        return 'Syncing with peers...';
                    case 'WAITING_PLAYERS':
                        return 'Waiting players to join the game...';
                    case 'WAITING_CHOICE':
                        return 'Waiting choice from ' + (currentPlayer.nickname || currentPlayer.id) + '...';
                    case 'WAITING_GUESS':
                        return 'Wating gues from ' + (currentPlayer.nickname || currentPlayer.id) + '...';
                    case 'ANNOUNCING_WINNER':
                        return (currentPlayer.nickname || currentPlayer.id) + ' has won the game!!!';
                    default:
                        return null;
                }
            },
            word: function () {
                return this.game.currentSupressedWord;
            },
            iAmTheCurrentPlayer: function () {
                if (this.game == null || this.game.currentPlayer == null || this.game.me == null) {
                    return null;
                }
                return this.game.currentPlayer.id == this.game.me.id;
            },
            isWaitingMyChoice: function () {
                return this.iAmTheCurrentPlayer && this.game.status == 'WAITING_CHOICE';
            },
            isWaitingMyGuess: function () {
                return this.iAmTheCurrentPlayer && this.game.status == 'WAITING_GUESS';
            }
        },
        components: {
            TurnChoice, TurnGuess,
            PlayerList, LoginForm
        },
        created: function () {
            var self = this;

            // countdown
            setInterval(function() {
                var now = (new Date().getTime());
                var lastingTimeMillis = self.game.timer - now;
                if (lastingTimeMillis > 0) {
                    self.timer = Math.round(lastingTimeMillis / 1000);
                } else {
                    self.timer = 0;
                }
            }, 200);

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
        margin: 30px auto;
        max-width: 900px;
    }

    .text-center {
        text-align: center;
    }

    .box {
        padding: 20px;
        border-radius: 5px;
        background-color: #fff;
    }
</style>
