<template>
    <v-app-bar :elevation="0" class="nav-bar">
        <!-- Leave the icon space empty -->
        <template #prepend> </template>
        <v-app-bar-title>Jelly Bean Flavors</v-app-bar-title>
    </v-app-bar>
</template>

<script setup lang="ts">
// Create a vuetify 3 v-app bar
import {
    VAppBar,
    VAppBarNavIcon,
    VAppBarTitle,
} from "vuetify/components/VAppBar";
</script>

<style lang="css" scoped>
.nav-bar {
    background-color: #383838;
    color: white;
}
</style>
