<template>
    <div id="players">
        <h3 class="text-center">Players</h3>
        <ul>
            <li v-for="player in players">
                {{ player.nickname || player.id }}
                <span class="pull-right">{{ player.roundPoints }}</span>
            </li>
        </ul>
        {{ players | json}}
    </div>
</template>
<style>
    ul {
        list-style: none;
        margin-left: 0;
        padding-left: 0;
    }

    ul > li {
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
    }

    .bolder {
        font-weight: bolder;
    }

    .text-center {
        text-align: center;
    }

    .pull-right {
        float: right;
    }

    #players {
        border-left: 1px dashed #ccc;
        padding: 0 0 10px 20px;
    }
</style>
<script>
    export default {
        props: {
            players: {
                type: Array,
                required: true
            }
        }
    }
</script>
