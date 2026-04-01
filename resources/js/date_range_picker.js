export default class DateRangePicker {
  #wrapper
  #picker
  #input
  #inputStardDate
  #inputEndDate

  constructor(wrapper, value) {
    if (!Array.isArray(value) || (value.length !== 0 && value.length !== 2)) {
      throw new Error('Invalid value given to date range picker')
    }

    this.#wrapper = wrapper
    this.#picker = wrapper.querySelector('wc-datepicker')
    this.#input = wrapper.querySelector('.input-date-range-picker')
    this.#inputStardDate = wrapper.querySelector('.input-date-range-picker-start-date')
    this.#inputEndDate = wrapper.querySelector('.input-date-range-picker-end-date')

    this.#picker.labels = {
      clearButton: 'Effacer',
      monthSelect: 'Choisir un mois',
      nextMonthButton: 'Mois suivant',
      nextYearButton: 'Année suivante',
      picker: 'Choisir une dates',
      previousMonthButton: 'Moi précédent',
      previousYearButton: 'Année précédente',
      todayButton: "Aujourd'hui",
      yearSelect: 'Choisir une années',
    }

    this.#bind(value)
  }

  static init(document) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-date-range-picker]').forEach((wrapper) => {
        if (wrapper.dataset.initialized) return
        wrapper.dataset.initialized = 'true'

        const value = JSON.parse(wrapper.dataset.value || '[]')
        new DateRangePicker(wrapper, value)
      })
    })
  }

  #bind(value) {
    this.#picker.addEventListener('selectDate', ({ detail }) => {
      // transform array of "YYYY-MM-DD" to string like "Entre le DD.MM.YYYY et le DD.MM.YYYY"
      this.#input.value = detail
        ? `Entre le ${detail.map((date) => date.split('-').reverse().join('.')).join(' et le ')}`
        : ''

      if (detail && detail.length === 2) {
        this.#inputStardDate.value = detail[0]
        this.#inputEndDate.value = detail[1]
        this.#inputStardDate.removeAttribute('disabled')
        this.#inputEndDate.removeAttribute('disabled')
      } else {
        this.#inputStardDate.value = null
        this.#inputEndDate.value = null
        this.#inputStardDate.setAttribute('disabled', 'disabled')
        this.#inputEndDate.setAttribute('disabled', 'disabled')
      }
    })

    this.#input.addEventListener('focus', () => {
      this.#picker.startDate = this.#inputStardDate.value
        ? new Date(this.#inputStardDate.value)
        : new Date()

      this.#openPicker()
    })

    document.addEventListener('mousedown', (e) => {
      if (!this.#wrapper.contains(e.target)) this.#closePicker()
    })

    if (value.length === 2) {
      this.#input.value = value
        ? `Entre le ${value.map((date) => date.split('-').reverse().join('.')).join(' et le ')}`
        : ''
      this.#inputStardDate.value = value[0]
      this.#inputEndDate.value = value[1]
      this.#picker.value = value.map((v) => new Date(v))
      this.#picker.startDate = new Date(value[0])
      this.#inputStardDate.removeAttribute('disabled')
      this.#inputEndDate.removeAttribute('disabled')
    } else {
      this.#inputStardDate.setAttribute('disabled', 'disabled')
      this.#inputEndDate.setAttribute('disabled', 'disabled')
    }
  }

  #openPicker() {
    this.#picker.style.visibility = 'visible'
  }

  #closePicker() {
    this.#picker.style.visibility = 'hidden'
  }
}
