<template>
    <div id="players">
        <h3 class="text-center">Next players</h3>
        <table>
            <thead>
                <tr>
                    <td><b>Player</b></td>
                    <td><b>Round</b></td>
                    <td><b>Total</b></td>
                </tr>
            </thead>
            <tr v-for="player in players" v-if="player.id != generator.id" v-bind:class="{'green': me.id == player.id}">
                <td>{{ player.nickname || player.id }}</td>
                <td>{{ player.roundPoints }}</td>
                <td>{{ player.totalPoints }}</td>
            </tr>
        </table>
    </div>
</template>
<style>
    .green {
        background-color: #D8FFBD;
    }
    table {
        width: 100%;
    }
    table > thead > tr > td {
        font-weight: bolder;
    }
    table td {
        padding: 5px 8px;
        border-bottom: 1px dashed #f0f0f0;
    }
    table tr:last-child td {
        border: none;
    }
</style>
<script>
    export default {
        props: {
            players: {
                type: Array,
                required: true
            },
            generator: {
                type: Object,
                required: false
            },
            me: {
                type: Object,
                required: false
            }
        }
    }
</script>
