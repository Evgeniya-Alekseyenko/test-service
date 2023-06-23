<template>
    <div class="container mt-4">
        <p class="text-center font-weight-bold display-4 gradient-text">
            Сервіс з ручного обліку відвідувачів
        </p>

        <div>
            <button @click="showDialog" class="btn btn-primary mb-4 p-2">
                Додати нового відвідувача
            </button>
            <Dialog
                v-if="dialogVisible"
                :show="dialogVisible"
                @close="hideDialog"
            >
                <div
                    class="container-sm py-4 px-4 d-flex flex-column justify-content-center align-items-center"
                >
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
                            id="add-button"
                            type="submit"
                            class="btn btn-primary"
                        >
                            Додати
                        </button>
                    </form>
                </div>
            </Dialog>
        </div>

        <div
            class="container-sm d-flex flex-column justify-content-center align-items-center"
        >
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
        </div>

        <div v-if="showDeleteConfirmation">
            <h2>Ви впевнені, що хочете видалити цього відвідувача?</h2>
            <p>
                {{ selectedVisitor.first_name }}
                {{ selectedVisitor.last_name }}
            </p>
            <button @click="deleteVisitor" class="btn btn-danger form-button">
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
        <table
            class="table table-hover table-bordered table-condensed table-striped"
        >
            <thead>
                <tr>
                    <th @click="sortColumn('first_name')">Ім'я</th>
                    <th @click="sortColumn('last_name')">Прізвище</th>
                    <th @click="sortColumn('time')">Час створення</th>
                    <th>Дії</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="visitor in sortedVisitors" :key="visitor.id">
                    <td>{{ visitor.first_name }}</td>
                    <td>{{ visitor.last_name }}</td>
                    <td>{{ formatTime(visitor.time) }}</td>
                    <td>
                        <div class="btn-container">
                            <button
                                id="edit-button"
                                class="btn btn-success mb-1"
                                @click="openEditVisitorForm(visitor)"
                            >
                                Змінити
                            </button>
                            <button
                                id="delete-button"
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
    </div>
</template>

<script>
import axios from 'axios';
import Dialog from './Dialog.vue';

const ROOT_URL =
    'https://zhmc97zap2.execute-api.eu-central-1.amazonaws.com/visitors';

let visitors_list = await axios
    .get(ROOT_URL)
    .then((response) => response.data.Items);

export default {
    components: {
        Dialog,
    },
    data() {
        return {
            visitors: visitors_list,
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
            dialogVisible: false,
        };
    },
    computed: {
        sortedVisitors() {
            return this.visitors.sort((a, b) => {
                const column = this.sortedColumn;
                const direction = this.sortDirection[column];

                if (column === 'time') {
                    const timeA = new Date(a[column]);
                    const timeB = new Date(b[column]);

                    if (direction === 'asc') {
                        return timeA - timeB;
                    } else {
                        return timeB - timeA;
                    }
                } else {
                    return direction === 'asc'
                        ? a[column].localeCompare(b[column])
                        : b[column].localeCompare(a[column]);
                }
            });
        },
        sortedColumn() {
            return Object.keys(this.sortDirection).find(
                (column) => this.sortDirection[column] !== ''
            );
        },
    },
    methods: {
        showDialog() {
            this.dialogVisible = true;
        },
        hideDialog() {
            this.dialogVisible = false;
        },
        formatTime(time) {
            return new Date(time).toLocaleString();
        },
        async fetchVisitorsList() {
            try {
                const response = await axios.get(ROOT_URL);
                this.visitors = response.data.Items;
            } catch (error) {
                console.error(error);
            }
        },
        async addVisitor() {
            try {
                const visitor = {
                    first_name: this.newVisitor.first_name,
                    last_name: this.newVisitor.last_name,
                    time: new Date().toISOString(),
                };

                const response = await axios.post(ROOT_URL, visitor);
                console.log(response.data);
                this.showAddForm = false;
                // Обновление списка пользователей
                this.fetchVisitorsList();
                //Закрываем модальное окно при добавлении нового посетителя,и очищаем поля ввода
                this.dialogVisible = false;
                this.newVisitor.first_name = '';
                this.newVisitor.last_name = '';
            } catch (error) {
                console.error(error);
            }
        },
        openEditVisitorForm(visitor) {
            this.selectedVisitor = { ...visitor };
            this.showEditForm = true;
        },
        async updateVisitor() {
            try {
                const { id, first_name, last_name } = this.selectedVisitor;
                const updateUrl = `${ROOT_URL}/${id}`;

                const updatedVisitor = {
                    first_name: first_name,
                    last_name: last_name,
                    time: new Date().toISOString(),
                };

                const response = await axios.put(updateUrl, updatedVisitor);
                console.log(response.data);

                // Очистка данных выбранного посетителя и скрытие формы редактирования
                this.selectedVisitor = {};
                this.showEditForm = false;

                // Обновление списка посетителей
                this.fetchVisitorsList();
            } catch (error) {
                console.error(error.response.data);
            }
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
            if (this.sortDirection[column] === 'asc') {
                this.sortDirection[column] = 'desc';
            } else {
                this.sortDirection[column] = 'asc';
            }
            Object.keys(this.sortDirection).forEach((key) => {
                if (key !== column) {
                    this.sortDirection[key] = '';
                }
            });
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

.dialog {
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    display: flex;
}

.dialog__content {
    margin: auto;
    background: white;
    border-radius: 12px;
    min-height: 50px;
    min-width: 300px;
    padding: 20px;
}

.gradient-text {
    background: linear-gradient(45deg, #23c77b, #0f86d6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.btn-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 460px) {
    th,
    td {
        font-size: 0.6rem;
    }
    div {
        font-size: 0.7rem;
    }
    p.display-4 {
        font-size: 1.5rem;
    }
    #delete-button,
    #edit-button,
    #add-button {
        font-size: 0.7rem;
        padding: 0.3rem 0.5rem;
    }
}

@media (max-width: 991px) {
    .btn-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
</style>
