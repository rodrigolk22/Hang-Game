module.exports = {
    me: '', // my nickname
    players: [], // game players (including me)
    hasPlayerWithNickname: function (nickname) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].nickname == nickname) {
                return true;
            }
        }
        return false;
    },
    addPlayer: function (nickname) {
        this.me = nickname;
        this.players.push({
            nickname: nickname,
            points: 0
        });
    }
};