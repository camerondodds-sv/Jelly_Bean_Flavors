<template>
    <v-app v-cloak>
        <NavigationBar />
        <v-main>
            <v-container class="d-flex" id="whole-app">
                <div class="jelly-bean-row">
                    <!-- View Jelly Beans -->
                    <div
                        v-for="(jellyBean, index) of jellyBeans"
                        :key="index"
                        class="card-parents"
                    >
                        <div class="jelly-bean-cards">
                            <v-card flat>
                                <v-card-title class="card-title-text">
                                    {{ jellyBean.name ?? "No Name" }}
                                </v-card-title>

                                <v-card-text>
                                    <star-rating
                                        :model-value="
                                            averageRatingByIndex[index]
                                        "
                                        @update:modelValue="
                                            updateRatingByIndex(index, $event)
                                        "
                                        :star-size="24"
                                        :inactive-color="'gray'"
                                    />
                                    <div class="d-flex flex-column mt-4">
                                        <div class="text-subtitle-2">
                                            Ratings
                                        </div>
                                        <div class="bold-body-text">
                                            {{ jellyBean.ratings.length }}
                                        </div>
                                    </div>

                                    <div class="d-flex flex-column mt-4">
                                        Color
                                        <div class="bold-body-text">
                                            {{ jellyBean.color }}
                                        </div>
                                    </div>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        variant="tonal"
                                        color="primary"
                                        append-icon="mdi-pencil"
                                        @click.stop="editJellyBean(index)"
                                    >
                                        Edit
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </div>
                    </div>
                    <!-- New Jelly Bean -->
                    <div class="card-parents" @click="addJellyBean()">
                        <v-card
                            class="jelly-bean-cards d-flex justify-center align-center"
                            flat
                        >
                            <v-icon icon="mdi-plus" class="add-jelly-bean" />
                        </v-card>
                    </div>
                </div>
                <!-- Navigation Drawer -->
                <v-navigation-drawer
                    v-model="data.openDrawer"
                    :class="{
                        'w-25': data.openDrawer,
                        'jelly-bean-drawer': true,
                    }"
                    location="right"
                    temporary
                >
                    <v-card v-if="data.openDrawer" :elevation="0" class="ma-2">
                        <v-card-title>
                            <h3>Jelly Bean Information</h3>
                        </v-card-title>
                        <v-card-text>
                            <v-text-field
                                v-model="data.currentJellyBean.name"
                                label="Name"
                                :rules="[validateJellyBeanName]"
                            />
                            <v-text-field
                                v-model="data.currentJellyBean.color"
                                label="Color"
                                :rules="[validateJellyBeanColor]"
                            />
                        </v-card-text>
                        <v-card-actions class="d-flex flex-column">
                            <v-btn
                                :loading="data.savingJellyBean"
                                :elevation="0"
                                :disabled="!validateJellyBean()"
                                block
                                prepend-icon="mdi-content-save-settings-outline"
                                color="primary"
                                variant="flat"
                                @click="saveJellyBean()"
                            >
                                <p>Save</p>
                            </v-btn>
                            <br />
                            <v-dialog v-model="data.showRemoveDialog">
                                <template #activator="{ props }">
                                    <v-btn
                                        v-if="data.accessMode !== CREATE_MODE"
                                        :elevation="0"
                                        data-cy="delete-profile-button"
                                        v-bind="props"
                                        block
                                        prepend-icon="mdi-trash-can-outline"
                                        color="primary"
                                        variant="outlined"
                                    >
                                        <p>Delete</p>
                                    </v-btn>
                                </template>
                                <div class="d-flex justify-center">
                                    <v-card min-width="20%" max-width="40%">
                                        <v-card-title class="text-h5">
                                            Remove
                                            {{
                                                data.currentJellyBean.name
                                                    ? data.currentJellyBean.name
                                                    : "Jelly Bean"
                                            }}?
                                        </v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                color="error"
                                                variant="flat"
                                                @click="
                                                    data.showRemoveDialog = false
                                                "
                                            >
                                                No
                                            </v-btn>
                                            <v-btn
                                                class="ml-8"
                                                color="success"
                                                variant="flat"
                                                @click="removeJellyBean()"
                                            >
                                                Yes
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </div>
                            </v-dialog>
                        </v-card-actions>
                    </v-card>
                </v-navigation-drawer>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import NavigationBar from "./components/NavigationBar.vue";
import { VApp } from "vuetify/components/VApp";
import { VMain } from "vuetify/components/VMain";
import { VCard } from "vuetify/components/VCard";
import {
    VContainer,
    VCol,
    VRow,
    VSelect,
    VCardTitle,
    VCardText,
    VTextField,
    VSpacer,
    VCardActions,
    VIcon,
    VNavigationDrawer,
    VDialog,
} from "vuetify/components";
import { VBtn } from "vuetify/components/VBtn";
import StarRating from "vue3-star-ratings";

import { ref, reactive, computed } from "vue";
import { cloneDeep } from "lodash";

// Types
type JellyBean = {
    name: string;
    color: string;
    ratings: number[];
};

// Data
const CREATE_MODE = "create";
const EDIT_MODE = "edit";

const data = reactive<{
    savingJellyBean: boolean;
    openDrawer: boolean;
    currentJellyBean: JellyBean;
    currentJellyBeanIndex: number;
    accessMode: string;
    showRemoveDialog: boolean;
}>({
    savingJellyBean: false,
    openDrawer: false,
    currentJellyBean: {} as JellyBean,
    currentJellyBeanIndex: -1,
    accessMode: CREATE_MODE,
    showRemoveDialog: false,
});

const jellyBeans = ref<JellyBean[]>([
    {
        name: "Blueberry",
        color: "Blue",
        ratings: [],
    },
    {
        name: "Strawberry",
        color: "Red",
        ratings: [],
    },
    {
        name: "Lemon",
        color: "Yellow",
        ratings: [],
    },
    {
        name: "Grape",
        color: "Purple",
        ratings: [],
    },
    {
        name: "Green Apple",
        color: "Green",
        ratings: [],
    },
    {
        name: "Cherry",
        color: "Red",
        ratings: [],
    },
]);

// Computed
const averageRatingByIndex = computed(() => {
    return jellyBeans.value.map((jellyBean) => {
        if (jellyBean.ratings.length === 0) {
            return 0;
        }

        const sum = jellyBean.ratings.reduce((a, b) => a + b, 0);
        return sum / jellyBean.ratings.length;
    });
});

// Methods
function updateRatingByIndex(index: number, rating: number) {
    console.log("Rating selected", rating);
    jellyBeans.value[index].ratings.push(rating);
}

function addJellyBean() {
    data.accessMode = CREATE_MODE;
    data.currentJellyBean = getEmptyJellyBean();
    openDrawer();
}

function editJellyBean(index: number) {
    data.accessMode = EDIT_MODE;
    data.currentJellyBean = cloneDeep({
        ...getEmptyJellyBean(),
        ...jellyBeans.value[index],
    });
    data.currentJellyBeanIndex = index;
    openDrawer();
}

function removeJellyBean() {
    data.showRemoveDialog = false;
    if (data.accessMode === EDIT_MODE) {
        jellyBeans.value.splice(data.currentJellyBeanIndex, 1);
    }
    closeDrawer();
}

function saveJellyBean() {
    if (data.accessMode === CREATE_MODE) {
        jellyBeans.value.push(cloneDeep(data.currentJellyBean));
    } else {
        jellyBeans.value[data.currentJellyBeanIndex] = {
            ...data.currentJellyBean,
        };
    }
    closeDrawer();
}

function openDrawer() {
    data.openDrawer = true;
}

function closeDrawer() {
    data.openDrawer = false;
}

function getEmptyJellyBean() {
    return {
        name: "",
        color: "",
        flavor: "",
        ratings: [],
    };
}

// Validations
function validateJellyBeanName(): boolean | string {
    if (!data.currentJellyBean.name) {
        return "Name is required";
    }

    return true;
}

function validateJellyBeanColor(): boolean | string {
    if (!data.currentJellyBean.color) {
        return "Color is required";
    }
    return true;
}

function validateJellyBean(): boolean {
    return (
        validateJellyBeanName() === true && validateJellyBeanColor() === true
    );
}
</script>

<style lang="scss">
#whole-app {
    min-height: 100%;
    max-width: none;
    display: flex;
    background-color: hsl(0, 0%, 95%);
}

.jelly-bean-cards {
    background-color: white;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.add-jelly-bean {
    font-size: 8em;
}

.card-parents {
    cursor: pointer;
    flex: 0 0 25%;
    max-width: 20%;
    min-width: 200px;
    padding: 12px;
}

.card-title-text {
    color: black;
    text-transform: capitalize;
    font-weight: 700;
}

.bold-body-text {
    font-size: 20px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 22px;
    color: #4c4c4c;
}

.jelly-bean-row {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    height: 100%;
}

.add-jelly-bean {
    height: 100%;
}

.jelly-bean-drawer {
    min-width: 300px;
}
</style>
