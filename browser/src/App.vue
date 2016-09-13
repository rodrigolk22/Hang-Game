<template>
    <div id="app">

        <table style="font-size: 0.8em">
            <tr>
                <td width="33.3%"><p v-if="my"><b>Playing as:</b> {{ my.nickname }}</p></td>
                <td width="33.3%"><p v-if="my"><b>ID:</b> {{ my.id }}</p></td>
                <td width="33.3%"><p v-show="timer > -1"><b>Time:</b> {{ timer }}s</p></td>
            </tr>
        </table>

        <div class="box text-center">
            <h3>{{ status }}</h3>
            <p class="text-center" v-show="word"><b>Word is:</b> {{ word }}</p>

            <!-- choice interface -->
            <turn-choice v-if="isWaitingMyChoice" :available-characters="game.availableCharacters"></turn-choice>

            <!-- guess interface -->
            <turn-guess v-if="isWaitingMyGuess"></turn-guess>

            <!-- generator interface -->
            <div v-if="iAmTheGenerator" class="alert alert-warning">
                I Am the Generator!!!
            </div>
        </div>

        <div class="box" v-if="game.players.length > 1">
            <!-- players list -->
            <player-list :players="game.players" :generator="game.currentGenerator" :me="game.me"></player-list>
        </div>
    </div>
</template>

<script>
    import PlayerList from './components/PlayerList.vue'
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
            iAmTheGenerator: function () {
                if (this.game == null || this.game.currentGenerator == null || this.game.me == null) {
                    return null;
                }
                return this.game.currentGenerator.id == this.game.me.id;
            },
            isWaitingMyChoice: function () {
                return this.iAmTheCurrentPlayer && this.game.status == 'WAITING_CHOICE';
            },
            isWaitingMyGuess: function () {
                return this.iAmTheCurrentPlayer && this.game.status == 'WAITING_GUESS';
            },
            my: function () {
                if (this.game == null || this.game.me == null) {
                    return {};
                }
                return this.game.me;
            }
        },
        components: {
            TurnChoice, TurnGuess,
            PlayerList
        },
        created: function () {
            var self = this;

            // countdown
            setInterval(function() {
                var now = (new Date().getTime());
                var lastingTimeMillis = self.game.timer - now;
                if (lastingTimeMillis > 0) {
                    self.timer = Math.floor(lastingTimeMillis / 1000);
                } else {
                    self.timer = 0;
                }
            }, 100);

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
        margin: 10px auto;
        padding: 20px;
        border-radius: 5px;
        background-color: #fff;
    }

    .alert {
        margin: 0 auto;
        padding: 10px 15px;
        font-weight: bolder;
    }

    .alert-warning {
        background-color: #FDFACB;
        border: 1px dashed #F6EDA0;
    }

    .alert-success {
        background-color: #D2FDC2;
        border: 1px dashed #ACCF9A;
    }
</style>
