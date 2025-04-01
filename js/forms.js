class FormManager {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    init() {
        try {
            // Добавляем обработчики событий
            this.addEventListeners();

            // Инициализируем все формы на странице
            this.initializeForms();
        } catch (error) {
            console.error('Ошибка инициализации FormManager:', error);
            window.notificationManager.error('Ошибка инициализации форм');
        }
    }

    addEventListeners() {
        // Обработка отправки форм
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.classList.contains('form')) {
                e.preventDefault();
                this.handleFormSubmit(form);
            }
        });

        // Обработка изменения полей
        document.addEventListener('change', (e) => {
            const field = e.target;
            if (field.closest('.form')) {
                this.handleFieldChange(field);
            }
        });

        // Обработка ввода в поля
        document.addEventListener('input', (e) => {
            const field = e.target;
            if (field.closest('.form')) {
                this.handleFieldInput(field);
            }
        });
    }

    initializeForms() {
        // Находим все формы на странице
        const formElements = document.querySelectorAll('.form');
        formElements.forEach(form => {
            this.registerForm(form);
        });
    }

    registerForm(formElement) {
        const formId = formElement.id;
        if (!formId) {
            console.warn('Форма не имеет ID');
            return;
        }

        // Создаем объект формы
        const form = {
            element: formElement,
            fields: this.getFormFields(formElement),
            isValid: false,
            onSubmit: null,
            onSuccess: null,
            onError: null
        };

        // Добавляем обработчики для полей
        this.addFieldHandlers(form);

        // Сохраняем форму
        this.forms.set(formId, form);

        // Валидируем форму
        this.validateForm(formId);
    }

    getFormFields(formElement) {
        const fields = new Map();
        const formFields = formElement.querySelectorAll('input, textarea, select');

        formFields.forEach(field => {
            const fieldId = field.id;
            if (!fieldId) {
                console.warn('Поле формы не имеет ID');
                return;
            }

            fields.set(fieldId, {
                element: field,
                rules: this.getFieldRules(field),
                isValid: false,
                error: null
            });
        });

        return fields;
    }

    getFieldRules(field) {
        const rules = [];
        const required = field.hasAttribute('required');
        const pattern = field.getAttribute('pattern');
        const minLength = field.getAttribute('minlength');
        const maxLength = field.getAttribute('maxlength');
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');

        if (required) {
            rules.push({
                type: 'required',
                message: 'Это поле обязательно для заполнения'
            });
        }

        if (pattern) {
            rules.push({
                type: 'pattern',
                pattern: new RegExp(pattern),
                message: field.getAttribute('data-pattern-message') || 'Неверный формат'
            });
        }

        if (minLength) {
            rules.push({
                type: 'minLength',
                value: parseInt(minLength),
                message: `Минимальная длина: ${minLength} символов`
            });
        }

        if (maxLength) {
            rules.push({
                type: 'maxLength',
                value: parseInt(maxLength),
                message: `Максимальная длина: ${maxLength} символов`
            });
        }

        if (min) {
            rules.push({
                type: 'min',
                value: parseFloat(min),
                message: `Минимальное значение: ${min}`
            });
        }

        if (max) {
            rules.push({
                type: 'max',
                value: parseFloat(max),
                message: `Максимальное значение: ${max}`
            });
        }

        return rules;
    }

    addFieldHandlers(form) {
        form.fields.forEach((field, fieldId) => {
            const element = field.element;

            // Добавляем обработчик фокуса
            element.addEventListener('focus', () => {
                this.handleFieldFocus(form.id, fieldId);
            });

            // Добавляем обработчик размытия
            element.addEventListener('blur', () => {
                this.handleFieldBlur(form.id, fieldId);
            });
        });
    }

    handleFieldFocus(formId, fieldId) {
        const form = this.forms.get(formId);
        if (!form) return;

        const field = form.fields.get(fieldId);
        if (!field) return;

        const element = field.element;
        element.classList.add('focused');
    }

    handleFieldBlur(formId, fieldId) {
        const form = this.forms.get(formId);
        if (!form) return;

        const field = form.fields.get(fieldId);
        if (!field) return;

        const element = field.element;
        element.classList.remove('focused');

        // Валидируем поле при размытии
        this.validateField(formId, fieldId);
    }

    handleFieldChange(field) {
        const form = field.closest('.form');
        if (!form) return;

        const formId = form.id;
        const fieldId = field.id;

        this.validateField(formId, fieldId);
    }

    handleFieldInput(field) {
        const form = field.closest('.form');
        if (!form) return;

        const formId = form.id;
        const fieldId = field.id;

        // Если поле уже было валидировано, проверяем его при вводе
        const formData = this.forms.get(formId);
        if (formData && formData.fields.get(fieldId).isValid !== null) {
            this.validateField(formId, fieldId);
        }
    }

    validateField(formId, fieldId) {
        const form = this.forms.get(formId);
        if (!form) return;

        const field = form.fields.get(fieldId);
        if (!field) return;

        const element = field.element;
        const value = element.value.trim();
        let isValid = true;
        let error = null;

        // Проверяем правила
        for (const rule of field.rules) {
            switch (rule.type) {
                case 'required':
                    if (!value) {
                        isValid = false;
                        error = rule.message;
                        break;
                    }
                    break;

                case 'pattern':
                    if (!rule.pattern.test(value)) {
                        isValid = false;
                        error = rule.message;
                        break;
                    }
                    break;

                case 'minLength':
                    if (value.length < rule.value) {
                        isValid = false;
                        error = rule.message;
                        break;
                    }
                    break;

                case 'maxLength':
                    if (value.length > rule.value) {
                        isValid = false;
                        error = rule.message;
                        break;
                    }
                    break;

                case 'min':
                    if (parseFloat(value) < rule.value) {
                        isValid = false;
                        error = rule.message;
                        break;
                    }
                    break;

                case 'max':
                    if (parseFloat(value) > rule.value) {
                        isValid = false;
                        error = rule.message;
                        break;
                    }
                    break;
            }

            if (!isValid) break;
        }

        // Обновляем состояние поля
        field.isValid = isValid;
        field.error = error;

        // Обновляем UI
        this.updateFieldUI(element, isValid, error);

        // Валидируем форму
        this.validateForm(formId);

        return isValid;
    }

    updateFieldUI(element, isValid, error) {
        const formGroup = element.closest('.form-group');
        if (!formGroup) return;

        // Обновляем классы
        formGroup.classList.remove('valid', 'invalid');
        if (isValid) {
            formGroup.classList.add('valid');
        } else {
            formGroup.classList.add('invalid');
        }

        // Обновляем сообщение об ошибке
        let errorElement = formGroup.querySelector('.error-message');
        if (error) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = error;
        } else if (errorElement) {
            errorElement.remove();
        }
    }

    validateForm(formId) {
        const form = this.forms.get(formId);
        if (!form) return false;

        let isValid = true;
        form.fields.forEach((field, fieldId) => {
            if (!field.isValid) {
                isValid = false;
            }
        });

        form.isValid = isValid;
        return isValid;
    }

    handleFormSubmit(form) {
        const formId = form.id;
        const formData = this.forms.get(formId);
        if (!formData) return;

        // Валидируем все поля формы
        let isValid = true;
        formData.fields.forEach((field, fieldId) => {
            if (!this.validateField(formId, fieldId)) {
                isValid = false;
            }
        });

        if (!isValid) {
            window.notificationManager.error('Пожалуйста, исправьте ошибки в форме');
            return;
        }

        // Собираем данные формы
        const data = this.getFormData(formId);

        // Вызываем callback при отправке
        if (formData.onSubmit) {
            formData.onSubmit(data);
        }
    }

    getFormData(formId) {
        const form = this.forms.get(formId);
        if (!form) return null;

        const data = {};
        form.fields.forEach((field, fieldId) => {
            const element = field.element;
            data[fieldId] = element.value.trim();
        });

        return data;
    }

    // Метод для добавления новой формы динамически
    addForm(formId, content, options = {}) {
        // Создаем элемент формы
        const formElement = document.createElement('form');
        formElement.id = formId;
        formElement.className = 'form';
        formElement.innerHTML = content;

        // Добавляем форму в DOM
        document.body.appendChild(formElement);

        // Регистрируем форму
        this.registerForm(formElement);

        // Применяем опции
        const form = this.forms.get(formId);
        if (form) {
            if (options.onSubmit) {
                form.onSubmit = options.onSubmit;
            }
            if (options.onSuccess) {
                form.onSuccess = options.onSuccess;
            }
            if (options.onError) {
                form.onError = options.onError;
            }
        }

        return formId;
    }

    // Метод для удаления формы
    removeForm(formId) {
        const form = this.forms.get(formId);
        if (!form) return;

        form.element.remove();
        this.forms.delete(formId);
    }

    // Метод для сброса формы
    resetForm(formId) {
        const form = this.forms.get(formId);
        if (!form) return;

        form.element.reset();
        form.fields.forEach((field, fieldId) => {
            field.isValid = null;
            field.error = null;
            this.updateFieldUI(field.element, null, null);
        });

        this.validateForm(formId);
    }

    // Метод для проверки валидности формы
    isFormValid(formId) {
        const form = this.forms.get(formId);
        return form ? form.isValid : false;
    }

    // Метод для получения данных формы
    getFormValues(formId) {
        return this.getFormData(formId);
    }

    // Метод для установки значений формы
    setFormValues(formId, values) {
        const form = this.forms.get(formId);
        if (!form) return;

        Object.entries(values).forEach(([fieldId, value]) => {
            const field = form.fields.get(fieldId);
            if (field) {
                field.element.value = value;
                this.validateField(formId, fieldId);
            }
        });
    }
}

// Создаем глобальный экземпляр
window.formManager = new FormManager(); 