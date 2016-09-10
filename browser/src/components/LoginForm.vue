<template>
    <div>
        <h3>Seus dados para entrar no jogo:</h3>
        <form v-on:submit.prevent="submit">
            <label for="nickname">Nickname</label>
            <input id="nickname" type="text" v-model="name"/>
            <button type="submit">entrar</button>
        </form>
    </div>
</template>
<style>

</style>
<script>
    export default{
        props: {
            nickname: {
                type: String,
                required: true
            }
        },
        data: function () {
            return {
                name: ''
            }
        },
        methods: {
            submit: function () {
                if (this.name != '') {
                    // send the name to the server and save the client nickname
                    this.$socket.emit('joinTheGame', this.name);
                    this.nickname = this.name;
                } else {
                    alert('preencha o nickname!');
                }
            }
        }
    }
</script>
