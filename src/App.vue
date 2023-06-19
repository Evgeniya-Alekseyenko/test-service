<template>
    <div class="container mt-4">
        <p class="text-center font-weight-bold display-4">
            Сервіс з ручного обліку відвідувачів
        </p>
        <button class="btn btn-primary mb-5" @click="openAddVisitorForm">
            Додати нового відвідувача
        </button>
        <div
            class="container py-4 px-4 border shadow mt-2 d-flex flex-column justify-content-center align-items-center"
        >
            <table class="table">
                <thead>
                    <tr>
                        <th @click="sortColumn('name')">Ім'я</th>
                        <th @click="sortColumn('surname')">Прізвище</th>
                        <th @click="sortColumn('entryTime')">Час створення</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="visitor in visitors" :key="visitor.id">
                        <td>{{ visitor.first_name }}</td>
                        <td>{{ visitor.last_name }}</td>
                        <td>{{ visitor.time }}</td>
                        <td>
                            <div class="btn-container">
                                <button
                                    id="edit"
                                    class="btn btn-secondary mb-1"
                                    @click="openEditVisitorForm(visitor)"
                                >
                                    Змінити
                                </button>
                                <button
                                    id="delete"
                                    class="btn btn-danger mb-1"
                                    style="margin-left: 10px"
                                    @click="confirmDeleteVisitor(visitor)"
                                >
                                    Видалити
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="showAddForm">
                <h2>Додати нового відвідувача</h2>
                <form @submit.prevent="addVisitor" class="form">
                    <input
                        v-model="newVisitor.first_name"
                        placeholder="Ім'я"
                        required
                        class="form-input"
                    />
                    <input
                        v-model="newVisitor.last_name"
                        placeholder="Прізвище"
                        required
                        class="form-input"
                    />
                    <button
                        id="add"
                        type="submit"
                        class="btn btn-primary"
                        style="margin-left: 10px"
                    >
                        Додати
                    </button>
                </form>
            </div>

            <div v-if="showEditForm">
                <h2>Змінити відвідувача</h2>
                <form @submit.prevent="updateVisitor" class="form">
                    <input
                        v-model="selectedVisitor.first_name"
                        placeholder="Ім'я"
                        required
                        class="form-input"
                    />
                    <input
                        v-model="selectedVisitor.last_name"
                        placeholder="Прізвище"
                        required
                        class="form-input"
                    />
                    <button type="submit" class="btn btn-primary form-button">
                        Зберегти
                    </button>
                </form>
            </div>

            <div v-if="showDeleteConfirmation">
                <h2>Ви впевнені, що хочете видалити цього відвідувача?</h2>
                <p>
                    {{ selectedVisitor.first_name }}
                    {{ selectedVisitor.last_name }}
                </p>
                <button
                    @click="deleteVisitor"
                    class="btn btn-danger form-button"
                >
                    Підтвердити видалення
                </button>
                <button
                    @click="cancelDelete"
                    class="btn btn-primary form-button"
                    style="margin-left: 10px"
                >
                    Скасувати
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

const ROOT_URL =
    'https://zhmc97zap2.execute-api.eu-central-1.amazonaws.com/visitors';

let visitors_list = await axios
    .get(ROOT_URL)
    .then((response) => response.data.Items);

export default {
    data() {
        return {
            visitors: visitors_list,
            // visitors: [
            //     {
            //         id: 1,
            //         first_name: 'Сергій',
            //         last_name: 'Сергієнко',
            //         time: '09:00',
            //     },
            //     {
            //         id: 2,
            //         first_name: 'Іван',
            //         last_name: 'Іваненко',
            //         time: '17:30',
            //     },
            //     {
            //         id: 3,
            //         first_name: 'Петро',
            //         last_name: 'Петренко',
            //         time: '10:45',
            //     },
            // ],
            newVisitor: { first_name: '', last_name: '' },
            selectedVisitor: {},
            showAddForm: false,
            showEditForm: false,
            showDeleteConfirmation: false,
            sortDirection: {
                first_name: 'asc',
                last_name: 'asc',
                time: 'asc',
            },
        };
    },
    methods: {
        openAddVisitorForm() {
            this.showAddForm = true;
        },
        // addVisitor() {
        //     const newVisitorId =
        //         Math.max(...this.visitors.map((visitor) => visitor.id)) + 1;
        //     this.newVisitor.id = newVisitorId;
        //     this.newVisitor.entryTime = new Date().toLocaleTimeString();
        //     this.visitors.push(this.newVisitor);
        //     this.newVisitor = { name: '', surname: '' };
        //     this.showAddForm = false;
        // },
        async addVisitor() {
            try {
                // const visitor = {
                //     name: 'Jane DOe',
                //     time: `${new Date().toISOString()}`,
                // };
                const visitor = {
                    first_name: this.newVisitor.first_name,
                    last_name: this.newVisitor.last_name,
                    time: new Date().toISOString(),
                };

                const response = await axios.post(
                    'https://zhmc97zap2.execute-api.eu-central-1.amazonaws.com/visitors',
                    visitor
                );
                console.log(response.data); // Вывод данных, полученных в ответ на POST-запрос
            } catch (error) {
                console.error(error);
            }
        },
        openEditVisitorForm(visitor) {
            this.selectedVisitor = { ...visitor };
            this.showEditForm = true;
        },
        updateVisitor() {
            const index = this.visitors.findIndex(
                (visitor) => visitor.id === this.selectedVisitor.id
            );
            if (index !== -1) {
                this.visitors[index] = { ...this.selectedVisitor };
            }
            this.selectedVisitor = {};
            this.showEditForm = false;
        },
        confirmDeleteVisitor(visitor) {
            this.selectedVisitor = { ...visitor };
            this.showDeleteConfirmation = true;
        },
        deleteVisitor() {
            const index = this.visitors.findIndex(
                (visitor) => visitor.id === this.selectedVisitor.id
            );
            if (index !== -1) {
                this.visitors.splice(index, 1);
            }
            this.selectedVisitor = {};
            this.showDeleteConfirmation = false;
        },
        cancelDelete() {
            this.selectedVisitor = {};
            this.showDeleteConfirmation = false;
        },
        sortColumn(column) {
            switch (this.sortDirection[column]) {
                case 'asc':
                    this.visitors.sort((a, b) => {
                        if (a[column] && b[column]) {
                            return a[column].localeCompare(b[column]);
                        }
                        return 0;
                    });
                    this.sortDirection[column] = 'desc';
                    break;
                case 'desc':
                    this.visitors.sort((a, b) => {
                        if (a[column] && b[column]) {
                            return b[column].localeCompare(a[column]);
                        }
                        return 0;
                    });
                    this.sortDirection[column] = 'asc';
                    break;
                default:
                    break;
            }
        },
    },
};
</script>

<style>
table {
    width: 100%;
}

th,
td {
    padding: 8px;
    text-align: left;
}

th {
    cursor: pointer;
}

.form {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

.form-input {
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;
}

.form-button {
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.form-button:hover {
    background-color: #0056b3;
}

@media (max-width: 460px) {
    div {
        font-size: 0.7rem;
    }
    p.display-4 {
        font-size: 1.5rem;
    }
    #delete,
    #edit,
    #add {
        font-size: 0.7rem;
        padding: 0.3rem 0.5rem;
    }
}

@media (max-width: 770px) {
    .btn-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 5px;
    }
}
</style>
